const User = require("../model/user.js")
const logger = require("../lib/logger")
const cache = require("../lib/cache")
const csvWriter = require("csv-writer")

/**
 * Insert or update user
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.insertOrUpdate = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const user = new User(req.body)
	
	try {
		logger.debug("Inserting or updating user: %O", user)
		const result = await User.insertOrUpdate(user)
		logger.info("User %d inserted/updated", user.id)
		res.send(result)
	} catch (err) {
		logger.error("Error on inserting/updating user Id %d", user.id)
		res.status(500).send({
			message: `Error on inserting or updating user`
		})
	}
}

/**
 * Query all users
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getAll = async (req, res) => {
	let options = {}

	if (req.query.paginated) {
		options.paginated = true
		options.sortField = req.query.sortField
		options.sortOrder = req.query.sortOrder
		options.pageSize = parseInt(req.query.pageSize)
		options.pageNo = parseInt(req.query.pageNo)
	}

	try {
		logger.debug("Getting all users: %O", options)
		const result = await User.getAll(options)
		res.send(result)
	} catch (err) {
		logger.error("Error on retrieving all users: %O", err)
		res.status(500).send({
			message: "Error on retrieving all users"
		})
	}
}

/**
 * Query user by id
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getById = async (req, res) => {
	try {
		logger.debug("Getting user id %d", req.params.id)
		const result = await User.getById(req.params.id)
		res.send(result)
	} catch (err) {
		logger.error("Error on retrieving user Id %d: %O", err)
		res.status(500).send({
			message: "Error on retreving user"
		})
	}
}

/**
 * Query all users and return a blob
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
 exports.export = async (req, res) => {
	try {
		logger.debug("Getting all users - export")

		const cachedMembers = cache.read('members', Number.MAX_VALUE)

		let result = await User.getAll({})
		result.map(e => {
			e.username = cachedMembers?.[e.id] ?? ""
			e.twitterUrl = null

			if (e.twitterHandle !== null && e.twitterHandle !== "") {
				e.twitterUrl = "https://twitter.com/" + e.twitterHandle
			}

			return e;
		})

		const csvStringifier = csvWriter.createObjectCsvStringifier({
			header: Object.keys(result[0]).map(e => { return { id: e, title: e }})
		});
	
		res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(result))
	} catch (err) {
		logger.error(`Error on retrieving users - export: %O`, err)
		res.status(500).send({
			message: "Error on retrieving users on export"
		})
	}
}