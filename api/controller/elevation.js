const Elevation = require("../model/elevation.js")
const Validation = require("../lib/validation")
const logger = require("../lib/logger")

/**
 * Insert post elevation
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

	const elevation = new Elevation(req.body)

	/** Validation **/
	let errors = []
	if (!Validation.isNumber(elevation.oldMessageId)) {
		errors.push({
			key: 'oldMessageId',
			message: 'Not a number'
		})
	}

	if (!Validation.isNumber(elevation.oldMessageId)) {
		errors.push({
			key: 'oldChannelId',
			message: 'Not a number'
		})
	}

	if (!Validation.isNumber(elevation.newMessageId)) {
		errors.push({
			key: 'newMessageId',
			message: 'Not a number'
		})
	}

	if (!Validation.isNumber(elevation.newChannelId)) {
		errors.push({
			key: 'newChannelId',
			message: 'Not a number'
		})
	}

	if (!Validation.isNumber(elevation.userId)) {
		errors.push({
			key: 'userId',
			message: 'Not a number'
		})
	}

	if (!Validation.isNotEmpty(elevation.username)) {
		errors.push({
			key: 'username',
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
		logger.debug("Inserting elevation: %O", elevation)
		const result = await Elevation.insert(elevation)
		logger.info("Elevation inserted")
		res.send(result)
	} catch (err) {
		logger.error("Error inserting elevation: %O", err)
		res.status(500).send({
			message: `Error on inserting elevation`
		})
	}
}

/**
 * Find elevations based on multiple conditions.
 * Payload example:
 * [
 *		{
 *			oldMessageId: MESSAGEID,
 *			newChannelId: NEWCHANNELID
 *		},
 *		{
 *			oldMessageId: MESSAGEID,
 *			newChannelId: NEWCHANNELID2
 *		}
 *	]
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.find = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	try {
		logger.debug("Finding elevations: %O", req.body)
		const result = await Elevation.find(req.body)
		res.send(result)
	} catch (err) {
		logger.error("Error on finding elevations: %O", err)
		res.status(500).send({
			message: "Error on finding elevations"
		})
	}
}

/**
 * Find elevation based on conditions
 * Payload example:
 * {
 *		oldMessageId: MESSAGEID,
 *		newChannelId: NEWCHANNELID
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
		logger.debug("Finding an elevation: %O", req.body)
		const result = await Elevation.findOne(req.body)
		res.send(result)
	} catch (err) {
		logger.error("Error on finding an elevation: %O", err)
		res.status(500).send({
			message: "Error on finding an elevation"
		})
	}
}