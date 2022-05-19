const Emoji = require("../model/emoji.js")
const io = require("../lib/io").getIO()

exports.insert = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const emoji = new Emoji(req.body)

	try {
		const result = await Emoji.insert(emoji)
		io.emit("update")
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on inserting emoji`
		})
	}
}

exports.update = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const emoji = new Emoji(req.body)

	try {
		const result = await Emoji.update(req.params.id, emoji)
		io.emit("update")
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on updating emoji with id ${req.params.id}`
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
		const result = await Emoji.delete(req.params.id)
		io.emit("update")
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on deleting emoji with id ${req.params.id}`
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
		const result = await Emoji.getAll(options)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving emojis."
		})
	}
}

exports.getById = async (req, res) => {
	try {
		const result = await Emoji.getById(req.params.id)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || `Some error occurred while retrieving emoji with id ${req.params.id}.`
		})
	}
}