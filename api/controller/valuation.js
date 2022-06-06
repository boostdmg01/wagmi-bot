const Valuation = require("../model/valuation.js")
const User = require("../model/user.js")
const logger = require("../lib/logger")

/**
 * Insert message valuation
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

	const valuation = new Valuation(req.body)

	try {
		logger.debug("Inserting valuation: %O", valuation)
		let result = await Valuation.insert(valuation)
		logger.info("Valuation inserted")

		result.message = null

		/** Try to get user and check if needed address for payout has been submitted */
		let userData = await User.getById(valuation.userId)

		if (userData.id) {
			if (req.body.treasuryType === 'substrate' && (userData.substrateAddress === null || userData.substrateAddress === "")) {
				result.message = `One of your messages has been valuated with ${valuation.value} ${req.body.coinName}. Please provide a Substrate address to The Concierge to receive your payout.`
			} else if (req.body.treasuryType === 'evm' && (userData.evmAddress === null || userData.evmAddress === "")) {
				result.message = `One of your messages has been valuated with ${valuation.value} ${req.body.coinName}. Please provide an EVM address to The Concierge to receive your payout.`
			}
		} else {
			result.message = `One of your messages has been valuated with ${valuation.value} ${req.body.coinName}. Please verify your credentials to The Concierge to receive your payout.`
		}

		res.send(result)
	} catch (err) {
		logger.error("Error on inserting valuation: %O", err)
		res.status(500).send({
			message: `Error on inserting valuation`
		})
	}
}

/**
 * Find message valuation based on conditions
 * Payload example:
 * {
 *		messageId: MESSAGEID,
 *		discordEmojiId: DISCORDEMOJIID
 *	}
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.findOne = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	try {
		logger.debug("Finding a valuation: %O", req.body)
		const result = await Valuation.findOne(req.body)
		res.send(result)
	} catch (err) {
		logger.error("Error on finding a valuation: %O", err)
		res.status(500).send({
			message: "Error on finding a valuation"
		})
	}
}

/**
 * Query all message valuations
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getAll = async (req, res) => {
	let options = {}

	if (req.query.searchFilter) {
		options.searchFilter = JSON.parse(req.query.searchFilter)
	}

	if (req.query.paginated) {
		options.paginated = true
		options.sortField = req.query.sortField
		options.sortOrder = req.query.sortOrder
		options.pageSize = parseInt(req.query.pageSize)
		options.pageNo = parseInt(req.query.pageNo)
	}

	try {
		logger.debug("Getting all valuations: %O", options)
		const result = await Valuation.getAll(options)
		res.send(result)
	} catch (err) {
		logger.error(`Error on retrieving valuations: %O`, err)
		res.status(500).send({
			message: "Error on retrieving valuations"
		})
	}
}

/**
 * Query all message valuations without sensitive data
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getAllPublic = async (req, res) => {
	let options = {}

	if (req.query.searchFilter) {
		options.searchFilter = JSON.parse(req.query.searchFilter)
	}

	if (req.query.paginated) {
		options.paginated = true
		options.sortField = req.query.sortField
		options.sortOrder = req.query.sortOrder
		options.pageSize = parseInt(req.query.pageSize)
		options.pageNo = parseInt(req.query.pageNo)
	}

	try {
		logger.debug("Getting all valuations (public): %O", options)
		const result = await Valuation.getAllPublic(options)
		res.send(result)
	} catch (err) {
		logger.error("Error on retrieving valuations (public): %O", err)
		res.status(500).send({
			message: "Error on retrieving valuations (public)"
		})
	}
}