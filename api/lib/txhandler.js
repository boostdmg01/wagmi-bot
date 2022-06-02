const sql = require("./sql.js")
const botIo = require("./io").getIO()
const Web3 = require('web3')
const { ApiPromise, Keyring, WsProvider } = require('@polkadot/api')
const polkadotUtil = require("@polkadot/util-crypto")
const crypto = require("./crypto")

/**
 * Transaction Handler which submits transactions based on valuated messages and royalities
 * 
 * Status Values:
 * 1 - Pending
 * 2 - Paid
 * 3 - Insufficient Balance in payout wallet
 * 4 - General Transaction Error
 * 5 - No receiver address specified
 * 6 - Insufficient Asset Balance (Statemine/Statemint)
 * 7 - Invalid encryption key
 */
class TransactionHandler {
    isRunning = false
    currentIo = null
    currentTransactionIndex = 0
    currentTransactionTotal = 0
    encryptionKey = null
    config = {}
    erc20Abi = [
        {
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "type": "function"
        }
    ]

    /**
     *  Start the processing transactions
     * 
     * @param io -  client socket receiving status updates
     * @param encryptionKey - encryptionKey sent by client for decrypting mnemonics/private keys
     */
    async run(io, encryptionKey) {
        this.isRunning = true
        this.currentIo = io
        this.currentTransactionIndex = 1
        this.encryptionKey = encryptionKey

        /** Get all valuated messages and royalities to process **/
        let [valuatedMessages] = await sql.query(`SELECT valuation.*, user.evmAddress, user.substrateAddress, treasury.coinName, treasury.name, treasury.type, treasury.rpcUrl, treasury.chainPrefix, treasury.mnemonic, treasury.isNative, treasury.parachainType, treasury.tokenAddress, treasury.tokenDecimals, treasury.chainTypes, treasury.privateKey, treasury.royalityEnabled, treasury.royalityAddress, treasury.royalityPercentage, treasury.assetId, treasury.sendMinBalance, treasury.sendExistentialDeposit FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) LEFT JOIN user ON (user.id = valuation.userId) WHERE transactionHash IS NULL ORDER BY valuation.timestamp ASC`)
        let [royalities] = await sql.query(`SELECT valuation.*, treasury.coinName, treasury.name, treasury.type, treasury.rpcUrl, treasury.chainPrefix, treasury.mnemonic, treasury.isNative, treasury.parachainType, treasury.tokenAddress, treasury.tokenDecimals, treasury.chainTypes, treasury.privateKey, treasury.royalityEnabled, treasury.royalityAddress, treasury.royalityPercentage, treasury.assetId, treasury.sendMinBalance, treasury.sendExistentialDeposit FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) WHERE royalityValue IS NOT NULL AND royalityTransactionHash IS NULL ORDER BY valuation.timestamp ASC`)

        this.currentTransactionTotal = valuatedMessages.length + royalities.length

        /** Return amount of actions to process to give client feedback **/
        this.currentIo.emit('processing', { current: this.currentTransactionIndex, total: this.currentTransactionTotal })

        /** Handle valuated messages **/
        if (valuatedMessages.length > 0) {
            await this.handleValuatedMessages(valuatedMessages)
        }

        /** Handle Royalitites of valuated messages **/
        if (royalities.length > 0) {
            await this.handleRoyalities(royalities)
        }

        this.isRunning = false
        this.encryptionKey = null
        this.currentIo.emit('processed')
    }

    /**
     * Handle transactions for valuated messages
     * 
     * @param rows - entities to be processed
     */
    async handleValuatedMessages(rows) {
        console.log('Transaction Handler', `Handling ${rows.length} message valuations`)
        for (let row of rows) {
            console.log('Transaction Handler', `Handling ${row.messageId} by ${row.username} valuated with ${row.value} ${row.name}`)

            /** Check if receiver has submitted a payout address (pre-validation done by the bot), if not set status = 5 **/
            if ((row.type === 'substrate' && (row.substrateAddress === null || row.substrateAddress === '')) || (row.type === 'evm' && (row.evmAddress === null || row.evmAddress === ''))) {
                await sql.execute('UPDATE valuation SET status = 5 WHERE id = ?', [row.id])

                continue
            }

            try {
                if (row.type === 'substrate') {
                    /** Process Substrate Transaction */
                    let { transactionHash, minBalanceBumped, sentExistentialDeposit } = await this.submitSubstrateTransaction(row).catch(e => { throw e })
                    
                    if (transactionHash !== null) {
                        /** Main Transaction successful; set status = 2, save txHash and timestamp and set flags if the balance has been bumped to minBalance and if existential deposit balance has been sent  **/
                        await sql.execute('UPDATE valuation SET status = ?, transactionHash = ?, transactionTimestamp = ?, minBalanceBumped = ?, sentExistentialDeposit = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), minBalanceBumped, sentExistentialDeposit, row.id])

                        let address = polkadotUtil.encodeAddress(row.substrateAddress, row.chainPrefix)

                        /** Inform user of the current payout **/
                        botIo.emit('send', {
                            userId: row.userId,
                            message: `Your message has been valuated with ${row.value} ${row.coinName}, paid out to: ${address}
    ${row.messageLink}`
                        })
                    }
                } else {
                    /** Process EVM Transaction **/
                    let transactionHash = await this.submitEVMTransaction(row).catch(e => { throw e })

                    if (transactionHash !== null) {
                        /** Main Transaction successful; set status = 2, save txHash and timestamp **/
                        await sql.execute('UPDATE valuation SET status = ?, transactionHash = ?, transactionTimestamp = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), row.id])

                        /** Inform user of the current payout */
                        botIo.emit('send', {
                            userId: row.userId,
                            message: `Your message has been valuated with ${row.value} ${row.coinName}, paid out to: ${row.evmAddress}
    ${row.messageLink}`
                        })
                    }
                }
            } catch (e) {
                console.log(e)
                /** Something went wrong, set status for given error message **/
                let status = 4
                if (e.message) {
                    if (e.message === "Insufficient Balance") {
                        status = 3
                    } else if (e.message === "Insufficient Asset Balance") {
                        status = 6
                    } else if (e.message === "Invalid encryption key") {
                        status = 7
                    }
                }

                await sql.execute('UPDATE valuation SET status = ? WHERE id = ?', [status, row.id])
            }

            this.currentTransactionIndex++

            /** Update client transaction process **/
            this.currentIo.emit('processing', { current: this.currentTransactionIndex, total: this.currentTransactionTotal })
        }
    }
    /**
     * Handle transactions for royalitites of valuated messages
     * 
     * @param rows - entities to be processed
     */
    async handleRoyalities(rows) {
        console.log('Transaction Handler', `Handling ${rows.length} royalities`)
        for (let row of rows) {
            console.log('Transaction Handler', `Handling royality: ${row.messageId}`)

            try {
                if (row.type === 'substrate') {
                    /** Process Substrate Transaction */
                    let { transactionHash, minBalanceBumped, sentExistentialDeposit } = await this.submitSubstrateTransaction(row, true).catch(e => { throw e })

                    /** Main Transaction successful; set royality status = 2, save royality txHash and royality timestamp and set royality flags if the balance has been bumped to minBalance and if existential deposit balance has been sent  **/
                    await sql.execute('UPDATE valuation SET royalityStatus = ?, royalityTransactionHash = ?,royalityTransactionTimestamp = ?, royalityMinBalanceBumped = ?, royalitySentExistentialDeposit = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), minBalanceBumped, sentExistentialDeposit, row.id])
                } else {
                    /** Process Substrate Transaction */
                    let transactionHash = await this.submitEVMTransaction(row, true).catch(e => { throw e })

                    /** Main Transaction successful; set royality status = 2, save royality txHash and royality timestamp  **/
                    await sql.execute('UPDATE valuation SET royalityStatus = ?, royalityTransactionHash = ?,royalityTransactionTimestamp = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), row.id])
                }
            } catch (e) {
                console.log(e)
                /** Something went wrong, set royality status for given error message **/
                let status = 4
                if (e.message) {
                    if (e.message === "Insufficient Balance") {
                        status = 3
                    } else if (e.message === "Insufficient Asset Balance") {
                        status = 6
                    } else if (e.message === "Invalid encryption key") {
                        status = 7
                    }
                }

                await sql.execute('UPDATE valuation SET royalityStatus = ? WHERE id = ?', [status, row.id])
            }

            this.currentTransactionIndex++
            /** Update client transaction process **/
            this.currentIo.emit('processing', { current: this.currentTransactionIndex, total: this.currentTransactionTotal })
        }
    }

    /**
     * Submit a substrate transaction
     * 
     * @param data - entity data for valuated messages/royality fee
     * @param royality - is a royality transaction
     * @returns 
     */
    async submitSubstrateTransaction(data, royality = false) {
        /** Define provder details for node connection, without retrying on error **/
        const wsProvider = new WsProvider(data.rpcUrl, 0)
        try {
            const keyRing = new Keyring({ type: 'sr25519' })

            let options = {}
            /** Optional Types that need to be specified for specific chains **/
            if (data.chainTypes !== null && data.chainTypes !== '') {
                options.types = JSON.parse(data.chainTypes)
            }

            options.provider = wsProvider
            options.throwOnConnect = true

            let api = new ApiPromise(options)

            /** Connect to provider **/
            wsProvider.connect()

            /** Wait for connection to establish or throw an error **/
            await api.isReadyOrError

            /** Get chain properties **/
            const chainProperties = await api.rpc.system.properties()

            /** Get tokenDecimals **/
            const tokenDecimals = chainProperties.tokenDecimals
                .unwrapOrDefault()
                .toArray()
                .map((i) => i.toNumber())

            /** Set wallet account decrypting mnemonic saved in database with the encryption key provided by the client **/
            const treasuryAccount = keyRing.addFromUri(crypto.decrypt(data.mnemonic, this.encryptionKey))

            /** Set SS58 chain prefix **/
            keyRing.setSS58Format(data.chainPrefix)


            let value = data.value
            if (royality) {
                /** If it is royality transaction, use the royalityValue **/
                value = data.royalityValue
            } else {
                /** Otherwise use the normal value and substract the royalityValue if specified **/
                if (data.royalityValue) value -= data.royalityValue
            }

            /** reeiverAddress defaults to treasury royalityAddress **/
            let receiverAddress = data.royalityAddress
            if (!royality) {
                /** If not a royality transaction, receiverAddress is any substrate address submitted by the user **/
                receiverAddress = data.substrateAddress
            }

            /** Flags if minBalance has been bumped and if existential depost has been sent **/
            let minBalanceBumped = 0
            let sentExistentialDeposit = 0

            if (data.parachainType === 0) {
                /** Native Token **/

                /** Treasury setting, send existential deposit to receiver */
                if (data.sendExistentialDeposit === 1) {
                    /** Get existential deposit constant **/
                    const existentialDeposit = api.consts.balances.existentialDeposit.toBn()

                    /** Get receiver balance and payout wallet balance **/
                    const receiverBalance = (await api.query.system.account(receiverAddress)).data.free.toBn()
                    const accountBalance = (await api.query.system.account(treasuryAccount.address)).data.free.toBn()

                    /** Receiver has not enough existential deposit balance, set flag for existential deposit being sent **/
                    if (existentialDeposit.gt(receiverBalance)) {
                        sentExistentialDeposit = 1
                        /** Payout wallet has not enough balance for transaction **/
                        if (existentialDeposit.gte(accountBalance)) {
                            throw new Error('Insufficient Balance')
                        }

                        /** Send existential deposit to receiver **/
                        await api.tx.balances.transferKeepAlive(polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix), existentialDeposit).signAndSend(treasuryAccount, { nonce: -1 })
                    }
                }

                /** Calculate valuation amount to send to receiver **/
                const fullAmount = Web3.utils.toBN(value * (10 ** tokenDecimals[0]))

                /** Check if payout wallet has enough balance to send the transaction **/
                const accountBalance = (await api.query.system.account(treasuryAccount.address)).data.free.toBn()
                if (fullAmount.gte(accountBalance)) {
                    throw new Error(`Insufficient Balance`)
                }

                /** Send valuation amount to receiver **/
                let transactionHash = (await api.tx.balances.transferKeepAlive(polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix), fullAmount).signAndSend(treasuryAccount, { nonce: -1 })).toHex()

                await wsProvider.disconnect()

                /** Return transaction hash and flags **/
                return { transactionHash, minBalanceBumped, sentExistentialDeposit }
            } else {
                /** Asset */

                /** Treasury setting, send existential deposit to receiver */
                if (data.sendExistentialDeposit === 1) {
                    /** Get existential deposit constant **/
                    const existentialDeposit = api.consts.balances.existentialDeposit.toBn()

                    /** Get receiver balance and payout wallet balance **/
                    const receiverBalance = (await api.query.system.account(receiverAddress)).data.free.toBn()
                    const accountBalance = (await api.query.system.account(treasuryAccount.address)).data.free.toBn()

                    /** Receiver has not enough existential deposit balance, set flag for existential deposit being sent **/
                    if (existentialDeposit.gt(receiverBalance)) {
                        sentExistentialDeposit = 1
                        /** Payout wallet has not enough balance for transaction **/
                        if (existentialDeposit.gte(accountBalance)) {
                            throw new Error('Insufficient Balance')
                        }

                        /** Send existential deposit to receiver **/
                        await api.tx.balances.transferKeepAlive(polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix), existentialDeposit).signAndSend(treasuryAccount, { nonce: -1 })
                    }
                }

                /** Get asset decimals **/
                const assetDecimals = (await api.query.assets.metadata(data.assetId)).decimals

                /** Calculate asset amount to send to receiver **/
                const assetAmount = Web3.utils.toBN(value * (10 ** assetDecimals))

                /**  */
                let assetAmountToSend = assetAmount

                /** Query receiver asset balance, payout wallet asset balance and asset min balance needed  **/
                const receiverAssetBalanceQuery = await api.query.assets.account(data.assetId, polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix))
                const receiverAssetBalance = receiverAssetBalanceQuery.isSome ? receiverAssetBalanceQuery.unwrap().balance : Web3.utils.toBN(0)
                const accountAssetBalanceQuery = await api.query.assets.account(data.assetId, treasuryAccount.address)
                const accountAssetBalance = accountAssetBalanceQuery.isSome ? accountAssetBalanceQuery.unwrap().balance : Web3.utils.toBN(0)
                const assetMinBalance = (await api.query.assets.asset(data.assetId)).unwrap().minBalance

                /** if treasury setting enabled to send min balance if receiver asset balance is not sufficient **/
                if (data.sendMinBalance === 1 && assetMinBalance.gt(receiverAssetBalance)) {
                    /** No need to bump the amount if the valuation amount is already bigger than the asset min balance, otherwise set flag and bump amount to send to asset min balance **/
                    if (assetAmount.lte(assetMinBalance)) {
    
                        minBalanceBumped = 1

                        assetAmountToSend = assetMinBalance
                    }
                }

                /** Payout wallet has not enough balance for transaction **/
                if (assetAmountToSend.gte(accountAssetBalance)) {
                    throw new Error(`Insufficient Asset Balance`)
                }

                /** Send amount to receiver **/
                let transactionHash = (await api.tx.assets.transferKeepAlive(data.assetId, polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix), assetAmountToSend).signAndSend(treasuryAccount, { nonce: -1 })).toHex()

                await wsProvider.disconnect()

                /** Return transaction hash and flags **/
                return { transactionHash, minBalanceBumped, sentExistentialDeposit }
            }
        } catch (e) {
            console.log(e)
            await wsProvider.disconnect()
            throw e
        }
    }

    async submitEVMTransaction(data, royality = false) {
        try {
            /** Connect to node **/
            const web3 = new Web3(data.rpcUrl)

            /** Get wallet account decrypting mnemonic saved in database with the encryption key provided by the client **/
            const treasuryAccount = web3.eth.accounts.privateKeyToAccount(crypto.decrypt(data.privateKey, this.encryptionKey))

            let value = data.value
            if (royality) {
                /** If it is royality transaction, use the royalityValue **/
                value = data.royalityValue
            } else {
                /** Otherwise use the normal value and substract the royalityValue if specified **/
                if (data.royalityValue) value -= data.royalityValue
            }

            /** reeiverAddress defaults to treasury royalityAddress **/
            let receiverAddress = data.royalityAddress
            if (!royality) {
                /** If not a royality transaction, receiverAddress is any substrate address submitted by the user **/
                receiverAddress = data.evmAddress
            }

            /** Calculate amount to be sent **/
            const fullAmount = Web3.utils.toBN(value * (10 ** data.tokenDecimals))

            if (data.isNative === 1) {
                /** Native Token **/

                /** Get balance of payout wallet **/
                const balanceFrom = Web3.utils.toBN(await web3.eth.getBalance(treasuryAccount.address))

                /** Not enough balance **/
                if (fullAmount.gte(balanceFrom)) {
                    throw new Error(`Insufficient Balance`)
                }

                /** Create and sign Transaction **/
                const createTransaction = await web3.eth.accounts.signTransaction(
                    {
                        gas: 21000,
                        to: receiverAddress,
                        value: fullAmount.toString(),
                    },
                    treasuryAccount.privateKey
                )

                /** Send signed transaction **/
                const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction)

                /** Return transactionHash **/
                return createReceipt.transactionHash
            } else {
                /** Contract token (ex ERC20s) **/
                let contract = new web3.eth.Contract(this.erc20Abi, data.tokenAddress)

                /** Get balance of payout wallet **/
                const accountBalance = Web3.utils.toBN(await contract.methods.balanceOf(treasuryAccount.address).call())

                /** Not enough balance **/
                if (fullAmount.gte(accountBalance)) {
                    throw new Error(`Insufficient Balance`)
                }

                /** Calculate data needed for transfer method **/
                const nonce = await web3.eth.getTransactionCount(treasuryAccount.address)

                const tx = contract.methods.transfer(receiverAddress, fullAmount)
                const gas = await tx.estimateGas({ from: treasuryAccount.address })
                const gasPrice = await web3.eth.getGasPrice()
                const encodedData = tx.encodeABI()

                /** Create and sign Transaction **/
                const createTransaction = await web3.eth.accounts.signTransaction(
                    {
                        to: data.tokenAddress,
                        data: encodedData,
                        gasLimit: gas,
                        gasPrice: gasPrice,
                        value: 0,
                        nonce: nonce,
                    },
                    treasuryAccount.privateKey
                )

                /** Send signed transaction **/
                const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction)

                /** Return transactionHash **/
                return createReceipt.transactionHash
            }
        } catch (e) {
            throw e
        }
    }
}

module.exports = new TransactionHandler()