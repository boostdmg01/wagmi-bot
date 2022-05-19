const User = require("../model/user.js")

exports.insertOrUpdate = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const user = new User(req.body)

	try {
		const result = await User.insertOrUpdate(user)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on inserting or updating user ${user.id}`
		})
	}
}

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
		const result = await User.getAll(options)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving users."
		})
	}
}

exports.getById = async (req, res) => {
	try {
		const result = await User.getById(req.params.id)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || `Some error occurred while retrieving user with id ${userId}.`
		})
	}
}