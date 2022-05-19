const sql = require("./sql.js")
const botIo = require("./io").getIO()
const BN = require("bn.js")
const Web3 = require('web3')
const BigNumber = require("bignumber.js")
const Config = require("../model/config")
const { ApiPromise, Keyring, WsProvider } = require('@polkadot/api')
const polkadotUtil = require("@polkadot/util-crypto")
const crypto = require("./crypto")

class TransactionHandler {
    isRunning = false
    currentIo = null
    currentTransactionIndex = 0
    currentTransactionTotal = 0
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

    async run(io) {
        this.isRunning = true
        this.currentIo = io
        this.currentTransactionIndex = 1

        await Config.getAll((err, data) => {
            if (err) throw new Error('Config error')
            else this.config = data
        })

        let [valuatedMessages] = await sql.query(`SELECT valuation.*, user.evmAddress, user.substrateAddress, treasury.coinName, treasury.name, treasury.type, treasury.rpcUrl, treasury.chainPrefix, treasury.mnemonic, treasury.isNative, treasury.parachainType, treasury.tokenAddress, treasury.tokenDecimals, treasury.chainTypes, treasury.privateKey, treasury.royalityEnabled, treasury.royalityAddress, treasury.royalityPercentage, treasury.assetId, treasury.sendMinBalance, treasury.sendExistentialDeposit FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) LEFT JOIN user ON (user.id = valuation.userId) WHERE transactionHash IS NULL ORDER BY valuation.timestamp ASC`)
        let [royalities] = await sql.query(`SELECT valuation.*, treasury.coinName, treasury.name, treasury.type, treasury.rpcUrl, treasury.chainPrefix, treasury.mnemonic, treasury.isNative, treasury.parachainType, treasury.tokenAddress, treasury.tokenDecimals, treasury.chainTypes, treasury.privateKey, treasury.royalityEnabled, treasury.royalityAddress, treasury.royalityPercentage, treasury.assetId, treasury.sendMinBalance, treasury.sendExistentialDeposit FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) WHERE royalityValue IS NOT NULL AND royalityTransactionHash IS NULL ORDER BY valuation.timestamp ASC`)

        this.currentTransactionTotal = valuatedMessages.length + royalities.length

        this.currentIo.emit('processing', { current: this.currentTransactionIndex, total: this.currentTransactionTotal })

        if (valuatedMessages.length > 0) {
            await this.handleValuatedMessages(valuatedMessages)
        }

        if (royalities.length > 0) {
            await this.handleRoyalities(royalities)
        }

        this.isRunning = false
        this.currentIo.emit('processed')
    }

    async handleValuatedMessages(rows) {
        console.log('Transaction Handler', `Handling ${rows.length} message valuations`)
        for (let row of rows) {
            console.log('Transaction Handler', `Handling ${row.messageId} by ${row.username} valuated with ${row.value} ${row.name}`)

            if ((row.type === 'substrate' && (row.substrateAddress === null || row.substrateAddress === '')) || (row.type === 'evm' && (row.evmAddress === null || row.evmAddress === ''))) {
                await sql.execute('UPDATE valuation SET status = 5 WHERE id = ?', [row.id])

                continue
            }

            try {
                if (row.type === 'substrate') {
                    let { transactionHash, minBalanceBumped, sentExistentialDeposit } = await this.submitSubstrateTransaction(row).catch(e => { throw e })
                    console.log(transactionHash, minBalanceBumped, sentExistentialDeposit)

                    if (transactionHash !== null) {
                        await sql.execute('UPDATE valuation SET status = ?, transactionHash = ?, transactionTimestamp = ?, minBalanceBumped = ?, sentExistentialDeposit = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), minBalanceBumped, sentExistentialDeposit, row.id])

                        let address = polkadotUtil.encodeAddress(row.substrateAddress, row.chainPrefix)

                        botIo.emit('send', {
                            userId: row.userId,
                            message: `Your message has been valuated with ${row.value} ${row.coinName}, paid out to: ${address}
    ${row.messageLink}`
                        })
                    }
                } else {
                    transactionHash = await this.submitEVMTransaction(row).catch(e => { throw e })

                    if (transactionHash !== null) {
                        await sql.execute('UPDATE valuation SET status = ?, transactionHash = ?, transactionTimestamp = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), row.id])

                        botIo.emit('send', {
                            userId: row.userId,
                            message: `Your message has been valuated with ${row.value} ${row.coinName}, paid out to: ${row.evmAddress}
    ${row.messageLink}`
                        })
                    }
                }
            } catch (e) {
                let status = 4
                if (e.message) {
                    if (e.message === "Insufficient Balance") {
                        status = 3
                    } else if (e.message === "Insufficient Asset Balance") {
                        status = 6
                    }
                }

                await sql.execute('UPDATE valuation SET status = ? WHERE id = ?', [status, row.id])
            }

            this.currentTransactionIndex++
            this.currentIo.emit('processing', { current: this.currentTransactionIndex, total: this.currentTransactionTotal })
        }
    }

    async handleRoyalities(rows) {
        console.log('Transaction Handler', `Handling ${rows.length} royalities`)
        for (let row of rows) {
            console.log('Transaction Handler', `Handling royality: ${row.messageId}`)

            try {
                if (row.type === 'substrate') {
                    let { transactionHash, minBalanceBumped, sentExistentialDeposit } = await this.submitSubstrateTransaction(row, true).catch(e => { throw e })

                    console.log(transactionHash, minBalanceBumped, sentExistentialDeposit)

                    await sql.execute('UPDATE valuation SET royalityStatus = ?, royalityTransactionHash = ?,royalityTransactionTimestamp = ?, royalityMinBalanceBumped = ?, royalitySentExistentialDeposit = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), minBalanceBumped, sentExistentialDeposit, row.id])
                } else {
                    let transactionHash = await this.submitEVMTransaction(row, true).catch(e => { throw e })

                    await sql.execute('UPDATE valuation SET royalityStatus = ?, royalityTransactionHash = ?,royalityTransactionTimestamp = ? WHERE id = ?', [2, transactionHash, Math.floor(Date.now() / 1000), row.id])
                }
            } catch (e) {
                let status = 4
                if (e.message && e.message === "Insufficient Balance") {
                    status = 3
                }

                await sql.execute('UPDATE valuation SET royalityStatus = ? WHERE id = ?', [status, row.id])
            }

            this.currentTransactionIndex++
            this.currentIo.emit('processing', { current: this.currentTransactionIndex, total: this.currentTransactionTotal })
        }
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    async submitSubstrateTransaction(data, royality = false) {
        const wsProvider = new WsProvider(data.rpcUrl, 0)
        try {
            const keyRing = new Keyring({ type: 'sr25519' })

            let options = {}
            if (data.chainTypes !== null && data.chainTypes !== '') {
                options.types = JSON.parse(data.chainTypes)
            }

            options.provider = wsProvider
            options.throwOnConnect = true

            let api = new ApiPromise(options)

            wsProvider.connect()

            await api.isReadyOrError

            const chainProperties = await api.rpc.system.properties()

            const tokenDecimals = chainProperties.tokenDecimals
                .unwrapOrDefault()
                .toArray()
                .map((i) => i.toNumber())

            const treasuryAccount = keyRing.addFromUri(crypto.decrypt(data.mnemonic))

            keyRing.setSS58Format(data.chainPrefix)

            let value = data.value
            if (royality) {
                value = data.royalityValue
            } else {
                if (data.royalityValue) value -= data.royalityValue
            }

            let receiverAddress = data.royalityAddress
            if (!royality) {
                receiverAddress = data.substrateAddress
            }

            let minBalanceBumped = 0
            let sentExistentialDeposit = 0

            if (data.parachainType === 0) {
                const tokenAmount = new BigNumber(value)
                const fullAmount = tokenAmount.multipliedBy(new BigNumber(10).pow(tokenDecimals[0]))
                const bnAmount = new BN(fullAmount.toFixed())

                const accountBalance = (await api.query.system.account(treasuryAccount.address)).data.free.toBn()
                if (bnAmount.gte(accountBalance)) {
                    throw new Error(`Insufficient Balance`)
                }

                let transactionHash = (await api.tx.balances.transferKeepAlive(polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix), bnAmount).signAndSend(treasuryAccount, { nonce: -1 })).toHex()

                await wsProvider.disconnect()

                return { transactionHash, minBalanceBumped, sentExistentialDeposit }
            } else {
                if (data.sendExistentialDeposit === 1) {
                    let existentialDeposit = (data.parachainType === 1 ? this.config.existential_deposit_statemine : this.config.existential_deposit_statemint)
                    let existentialDepositTokenDecimals = (data.parachainType === 1 ? 12 : 10)
                    const tokenAmount = new BigNumber(existentialDeposit)
                    const fullAmount = tokenAmount.multipliedBy(new BigNumber(10).pow(existentialDepositTokenDecimals))
                    const existentialDepositBn = new BN(fullAmount.toFixed())

                    const receiverBalance = (await api.query.system.account(receiverAddress)).data.free.toBn()
                    const accountBalance = (await api.query.system.account(treasuryAccount.address)).data.free.toBn()
                    if (existentialDepositBn.gt(receiverBalance)) {
                        sentExistentialDeposit = 1
                        if (existentialDepositBn.gte(accountBalance)) {
                            throw new Error('Insufficient Balance')
                        }

                        await api.tx.balances.transferKeepAlive(polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix), existentialDepositBn).signAndSend(treasuryAccount, { nonce: -1 })
                    }
                }

                const assetDecimals = (await api.query.assets.metadata(data.assetId)).decimals

                const assetAmount = new BigNumber(value)
                const assetFullAmount = assetAmount.multipliedBy(new BigNumber(10).pow(assetDecimals))
                let assetAmountBn = new BN(assetFullAmount.toFixed())

                const receiverAssetBalanceQuery = await api.query.assets.account(data.assetId, polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix))
                const receiverAssetBalance = receiverAssetBalanceQuery.isSome ? receiverAssetBalanceQuery.unwrap().balance : new BN(0)
                const accountAssetBalanceQuery = await api.query.assets.account(data.assetId, treasuryAccount.address)
                const accountAssetBalance = accountAssetBalanceQuery.isSome ? accountAssetBalanceQuery.unwrap().balance : new BN(0)
                const assetMinBalance = (await api.query.assets.asset(567)).unwrap().minBalance
                if (data.sendMinBalance === 1 && assetMinBalance.gt(receiverAssetBalance)) {
                    minBalanceBumped = 1

                    assetAmountBn = assetMinBalance
                }

                if (assetAmountBn.gte(accountAssetBalance)) {
                    throw new Error(`Insufficient Asset Balance`)
                }

                let transactionHash = (await api.tx.assets.transferKeepAlive(data.assetId, polkadotUtil.encodeAddress(receiverAddress, data.chainPrefix), assetAmountBn).signAndSend(treasuryAccount, { nonce: -1 })).toHex()

                await wsProvider.disconnect()

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
            const web3 = new Web3(data.rpcUrl)

            const treasuryAccount = web3.eth.accounts.privateKeyToAccount(crypto.decrypt(data.privateKey))

            let value = data.value
            if (royality) {
                value = data.royalityValue
            } else {
                if (data.royalityValue) value -= data.royalityValue
            }

            let receiverAddress = data.royalityAddress
            if (!royality) {
                receiverAddress = data.evmAddress
            }

            const tokenAmount = new BigNumber(value)
            const fullAmount = tokenAmount.multipliedBy(new BigNumber(10).pow(data.tokenDecimals))
            const bnAmount = new BN(fullAmount.toFixed())

            if (data.isNative === 1) {
                const balanceFrom = web3.utils.fromWei(await web3.eth.getBalance(treasuryAccount.address), 'ether')

                if (bnAmount.gte(balanceFrom)) {
                    throw new Error(`Insufficient Balance`)
                }

                const createTransaction = await web3.eth.accounts.signTransaction(
                    {
                        gas: 21000,
                        to: receiverAddress,
                        value: bnAmount.toString(),
                    },
                    treasuryAccount.privateKey
                )

                const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction)

                return createReceipt.transactionHash
            } else {
                let contract = new web3.eth.Contract(this.erc20Abi, data.tokenAddress)

                let accountBalance = await contract.methods.balanceOf(treasuryAccount.address).call()

                let accountBalanceBn = new BN(accountBalance)

                if (bnAmount.gte(accountBalanceBn)) {
                    throw new Error(`Insufficient Balance`)
                }

                const nonce = await web3.eth.getTransactionCount(treasuryAccount.address)

                const tx = contract.methods.transfer(receiverAddress, bnAmount)
                const gas = await tx.estimateGas({ from: treasuryAccount.address })
                const gasPrice = await web3.eth.getGasPrice()
                const encodedData = tx.encodeABI()

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

                const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction)

                return createReceipt.transactionHash
            }
        } catch (e) {
            throw e
        }
    }
}

module.exports = new TransactionHandler()