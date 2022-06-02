const Treasury = require("../model/treasury.js")
const Validation = require("../lib/validation")
const io = require("../lib/io").getIO()

exports.insert = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const treasury = new Treasury(req.body)

	let errors = checkTreasuryValidation(treasury)

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		const result = await Treasury.insert(treasury)
		io.emit("update")
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on inserting treasury`
		})
	}
}

exports.update = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const treasury = new Treasury(req.body)

	let errors = checkTreasuryValidation(treasury, true)

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		const result = await Treasury.update(req.params.id, treasury)
		io.emit("update")
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on updating treasury with id ${req.params.id}`
		})
	}
}

exports.delete = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	let errors = []
	if (!Validation.isNumber(req.params.id)) {
		errors.push({
			key: 'id',
			message: 'Not a number'
		})
	}

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		const result = await Treasury.delete(req.params.id)
		io.emit("update")
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on deleting treasury with id ${req.params.id}`
		})
	}
}

exports.getAll = async (req, res) => {
	let options = {}

	if (req.query.searchFilter) {
		options.searchFilter = req.query.searchFilter
	}

	if (req.query.paginated) {
		options.paginated = true
		options.sortField = req.query.sortField
		options.sortOrder = req.query.sortOrder
		options.pageSize = parseInt(req.query.pageSize)
		options.pageNo = parseInt(req.query.pageNo)
	}

	try {
		const result = await Treasury.getAll(options)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving treasuries."
		})
	}
}

exports.getById = async (req, res) => {
	let errors = []
	if (!Validation.isNumber(req.params.id)) {
		errors.push({
			key: 'id',
			message: 'Not a number'
		})
	}

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		const result = await Treasury.getById(req.params.id)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || `Some error occurred while retrieving treasury with id ${req.params.id}.`
		})
	}
}

exports.getAllPublic = async (req, res) => {
	try {
		const result = await Treasury.getAllPublic()
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving treasuries."
		})
	}
}

checkTreasuryValidation = (treasury, isUpdate = false) => {
	let errors = []
	if (!Validation.isNotEmpty(treasury.name)) {
		errors.push({
			key: 'name',
			message: 'Can not be empty'
		})
	}

	if (!Validation.isNotEmpty(treasury.coinName)) {
		errors.push({
			key: 'coinName',
			message: 'Can not be empty'
		})
	}

	if (!Validation.isNotEmpty(treasury.encryptionKey)) {
		errors.push({
			key: 'encryptionKey',
			message: 'Can not be empty'
		})
	}

	if (treasury.elevationActive) {
		if (!Validation.isNumber(treasury.elevationChannelId)) {
			errors.push({
				key: 'elevationChannelId',
				message: 'Not a number'
			})
		}

		if (!Validation.isNumber(treasury.elevationEmojiId)) {
			errors.push({
				key: 'elevationEmojiId',
				message: 'Not a number'
			})
		}

		if (!Validation.isNumber(treasury.elevationAmount)) {
			errors.push({
				key: 'elevationAmount',
				message: 'Not a number'
			})
		}
	}

	if (!Validation.isWebsocket(treasury.rpcUrl)) {
		errors.push({
			key: 'rpcUrl',
			message: 'Not a valid RPC URL'
		})
	}

	if (treasury.type === "substrate") {
		if (!Validation.isNumber(treasury.chainPrefix)) {
			errors.push({
				key: 'chainPrefix',
				message: 'Not a number'
			})
		}

		if (Validation.isNotEmpty(treasury.chainTypes) && !Validation.isJSON(treasury.chainTypes)) {
			errors.push({
				key: 'chainTypes',
				message: 'Not a valid json'
			})
		}

		if (treasury.parachainType === 1) {
			if (!Validation.isNumber(treasury.assetId)) {
				errors.push({
					key: 'assetId',
					message: 'Not a number'
				})
			}
		}

		if (treasury.royalityEnabled === 1) {
			if (!Validation.isSubstrateAddress(treasury.royalityAddress)) {
				errors.push({
					key: 'royalityAddress',
					message: 'Not a Substrate address'
				})
			}
		}

		if (!isUpdate && !Validation.isNotEmpty(treasury.mnemonic)) {
			errors.push({
				key: 'mnemonic',
				message: 'Can not be empty'
			})
		}
	} else if (treasury.type === "evm") {
		if (treasury.isNative === 0) {
			if (!Validation.isEVMAddress(treasury.tokenAddress)) {
				errors.push({
					key: 'tokenAddress',
					message: 'Not an EVM address'
				})
			}

			if (!Validation.isNumber(treasury.tokenDecimals)) {
				errors.push({
					key: 'tokenDecimals',
					message: 'Not a number'
				})
			}
		}

		if (treasury.royalityEnabled === 1) {
			if (!Validation.isEVMAddress(treasury.royalityAddress)) {
				errors.push({
					key: 'royalityAddress',
					message: 'Not an EVM address'
				})
			}
		}

		if (!isUpdate && !Validation.isNotEmpty(treasury.privateKey)) {
			errors.push({
				key: 'privateKey',
				message: 'Can not be empty'
			})
		}
	} else {
		errors.push({
			key: 'type',
			message: 'Unknown selection'
		})
	}

	if (treasury.royalityEnabled === 1) {
		if (!Validation.isNumberOrDecimal(treasury.royalityPercentage)) {
			errors.push({
				key: 'royalityPercentage',
				message: 'Not a number or decimal'
			})
		}
	}

	return errors
}