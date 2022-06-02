const Elevation = require("../model/elevation.js")
const Validation = require("../lib/validation")

exports.insert = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const elevation = new Elevation(req.body)

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

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		const result = await Elevation.insert(elevation)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: `Error on inserting elevation`
		})
	}
}

exports.find = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	try {
		const result = await Elevation.find(req.body)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving valuations."
		})
	}
}


exports.findOne = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	try {
		const result = await Elevation.findOne(req.body)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving valuations."
		})
	}
}

exports.getAll = async (req, res) => {
	let options = {}

	let errors = []
	
	if (req.query.searchFilter) {
		if (!Validation.isNotEmpty(req.query.searchFilter)) {
			errors.push({
				key: 'searchFilter',
				message: 'Empty'
			})
		}
		options.searchFilter = req.query.searchFilter
	}

	if (req.query.paginated) {
		options.paginated = true
		options.sortField = req.query.sortField
		options.sortOrder = req.query.sortOrder
		options.pageSize = parseInt(req.query.pageSize)
		options.pageNo = parseInt(req.query.pageNo)
	}

	if (errors.length) {
		res.status(422).send({
			message: 'Validation failed',
			errors
		})
		return
	}

	try {
		const result = await Elevation.getAll(options)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving elevations."
		})
	}
}