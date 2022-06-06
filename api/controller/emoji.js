const Emoji = require("../model/emoji.js")
const Validation = require("../lib/validation")
const io = require("../lib/io").getIO()
const logger = require("../lib/logger")

/**
 * Insert emoji
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

	const emoji = new Emoji(req.body)

	let errors = checkEmojiValidation(emoji)

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		logger.debug("Inserting emoji: %O", emoji)
		const result = await Emoji.insert(emoji)
		logger.info("Emoji inserted")
		io.emit("update")
		res.send(result)
	} catch (err) {
		logger.error("Error on inserting emoji: %O", err)
		res.status(500).send({
			message: `Error on inserting emoji`
		})
	}
}

/**
 * Update emoji
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

	const emoji = new Emoji(req.body)

	let errors = checkEmojiValidation(emoji)

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		logger.debug("Updating emoji Id %d: %O", req.params.id, emoji)
		const result = await Emoji.update(req.params.id, emoji)
		logger.info("Emoji Id %d updated", req.params.id)
		io.emit("update")
		res.send(result)
	} catch (err) {
		logger.error(`Error on updating emoji Id %d: %O`, req.params.id, err)
		res.status(500).send({
			message: `Error on updating emoji`
		})
	}
}

/**
 * Delete emoji
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
		logger.debug("Deleting emoji Id %d", req.params.id)
		const result = await Emoji.delete(req.params.id)
		logger.info("Emoji Id %d deleted", req.params.id)
		io.emit("update")
		res.send(result)
	} catch (err) {
		logger.error(`Error on deleting emoji Id %d: %O`, req.params.id, err)
		res.status(500).send({
			message: `Error on deleting emoji`
		})
	}
}

/**
 * Query all emojis
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
		logger.debug("Getting all emojis: %O", options)
		const result = await Emoji.getAll(options)
		res.send(result)
	} catch (err) {
		logger.error(`Error on retrieving emojis: %O`, err)
		res.status(500).send({
			message: "Error on retrieving emojis"
		})
	}
}

/**
 * Query emoji by id
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
		logger.debug("Getting emoji id %d", req.params.id)
		const result = await Emoji.getById(req.params.id)
		res.send(result)
	} catch (err) {
		logger.error(`Error on retrieving emoji id $d: %O`, req.params.id, err)
		res.status(500).send({
			message: `Error on retrieving emoji`
		})
	}
}

/**
 * Validate emoji object
 * 
 * @param {object} req - Emoji object
 */
checkEmojiValidation = (emoji) => {
	let errors = []
	if (!Validation.isNumber(emoji.emojiId)) {
		errors.push({
			key: 'emojiId',
			message: 'Not a number'
		})
	}

	if (!Validation.isNumberOrDecimal(emoji.amount)) {
		errors.push({
			key: 'amount',
			message: 'Not a number or decimal'
		})
	}

	if (!Validation.isNumber(emoji.treasuryId)) {
		errors.push({
			key: 'treasuryId',
			message: 'Not a number'
		})
	}

	return errors
}