const logger = require("../lib/logger")
const Config = require("../model/config.js")
const io = require("../lib/io").getIO()

/**
 *  Update configuration with provided key => value object 
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

	try {
		logger.debug("Updating configuration: %O", req.body)
		const result = await Config.update(req.body)
		logger.info("Configuration updated")
		io.emit("update")
		res.send(result)
	} catch (err) {
		logger.error("Error on updating configuration: %O", err)
		res.status(500).send({
			message: "Error on updating configuration"
		})
	}
}

/**
 *  Emit verification event to discord bot to reset the verification post
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.verification = async (req, res) => {
	logger.debug("Resetting verification post")
	io.emit("verification", (response) => {
		if (response.status !== 200) {
			logger.error("Error on resetting verification post: %O", response.err)
			res.status(500).send({ message: 'Error on resetting verification post!' })
		} else {
			logger.info("Verification post has been reset!")
			res.send({ message: 'Verification post has been reset!' })
		}
	})
}

/**
 * Return requested configuration values (request must contain an array of config keys)
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
		logger.debug("Getting configuration values: %O", req.body)
		const result = await Config.find(req.body)
		res.send(result)
	} catch (err) {
		logger.error("Error on retrieving configuration values for %O: %O", req.body, err)
		res.status(500).send({
			message: "Error on retrieving the configuration"
		})
	}
}

/**
 * Return all configuration values
 * 
 * @param {*} - req 
 * @param {*} - res 
 */
exports.getAll = async (req, res) => {
	try {
		logger.debug("Getting all configuration values")
		const result = await Config.getAll()
		res.send(result)
	} catch (err) {
		logger.error("Error on retrieving configuration values for %O: %O", req.body, err)
		res.status(500).send({
			message: "Error on retrieving the configuration"
		})
	}
}