const Treasury = require("../model/treasury.js")
const Validation = require("../lib/validation")
const io = require("../lib/io").getIO()
const logger = require("../lib/logger")

/**
 * Insert treasury
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
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
		logger.debug("Inserting treasury: %O", treasury)
		const result = await Treasury.insert(treasury)
		logger.info("Treasury inserted")
		io.emit("update")
		res.send(result)
	} catch (err) {
		logger.error(`Error on inserting treasury Id %d: %O`, req.params.id, err)
		res.status(500).send({
			message: `Error on inserting treasury`
		})
	}
}

/**
 * Update treasury
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
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
		logger.debug("Updating treasury Id %d: %O", req.params.id, treasury)
		const result = await Treasury.update(req.params.id, treasury)
		logger.info("Treasury Id %d updated", req.params.id)
		io.emit("update")
		res.send(result)
	} catch (err) {
		logger.error(`Error on updating treasury Id %d: %O`, req.params.id, err)
		res.status(500).send({
			message: `Error on updating treasury`
		})
	}
}

/**
 * Delete treasury
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
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
		logger.debug("Deleting treasury Id %d", req.params.id)
		const result = await Treasury.delete(req.params.id)
		logger.info("Treasury Id %d deleted", req.params.id)
		io.emit("update")
		res.send(result)
	} catch (err) {
		logger.error(`Error on deleting treasury Id %d: %O`, req.params.id, err)
		res.status(500).send({
			message: `Error on deleting treasury`
		})
	}
}

/**
 * Query all treasuries
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
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
		logger.debug("Getting all treasuries: %O", options)
		const result = await Treasury.getAll(options)
		res.send(result)
	} catch (err) {
		logger.error(`Error on retrieving treasuries: %O`, err)
		res.status(500).send({
			message: "Error on retrieving treasuries"
		})
	}
}

/**
 * Query treasury by id
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
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
		logger.debug("Getting treasury id %d", req.params.id)
		const result = await Treasury.getById(req.params.id)
		res.send(result)
	} catch (err) {
		logger.error(`Error on retrieving treasury id $d: %O`, req.params.id, err)
		res.status(500).send({
			message: "Error on retrieving treasury id"
		})
	}
}

/**
 * Get all treasuries without sensitive data
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getAllPublic = async (req, res) => {
	try {
		logger.debug("Getting all treasuries (public)")
		const result = await Treasury.getAllPublic()
		res.send(result)
	} catch (err) {
		logger.error("Error on retrieving treasuries (public): %O", err)
		res.status(500).send({
			message: "Error on retrieving treasuries (public)"
		})
	}
}

/**
 * Validate treasury object
 * 
 * @param {object} treasury - Treasury object
 * @param {boolean} isUpdate - flag if update method
 */
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

		if (Validation.isNotEmpty(treasury.chainOptions) && !Validation.isJSON(treasury.chainOptions)) {
			errors.push({
				key: 'chainOptions',
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

		if (treasury.royaltyEnabled === 1) {
			if (!Validation.isSubstrateAddress(treasury.royaltyAddress)) {
				errors.push({
					key: 'royaltyAddress',
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

		if (treasury.royaltyEnabled === 1) {
			if (!Validation.isEVMAddress(treasury.royaltyAddress)) {
				errors.push({
					key: 'royaltyAddress',
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

	if (treasury.royaltyEnabled === 1) {
		if (!Validation.isNumberOrDecimal(treasury.royaltyPercentage)) {
			errors.push({
				key: 'royaltyPercentage',
				message: 'Not a number or decimal'
			})
		}
	}

	return errors
}