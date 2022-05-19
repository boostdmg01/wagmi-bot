const Treasury = require("../model/treasury.js")
const io = require("../lib/io").getIO()

exports.insert = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const treasury = new Treasury(req.body)

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