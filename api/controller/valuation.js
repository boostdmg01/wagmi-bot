const Valuation = require("../model/valuation.js")
const User = require("../model/user.js")

exports.insert = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	const valuation = new Valuation(req.body)

	try {
		let result = await Valuation.insert(valuation)

		result.message = null

		let userData = await User.getById(valuation.userId)

		if (userData.id) {
			if (req.body.treasuryType === 'substrate' && (userData.substrateAddress === null || userData.substrateAddress === "")) {
				data.message = `One of your messages has been valuated with ${valuation.value} ${req.body.coinName}. Please provide an Substrate address to The Concierge to receive your payout.`
			} else if (req.body.treasuryType === 'evm' && (userData.evmAddress === null || userData.evmAddress === "")) {
				data.message = `One of your messages has been valuated with ${valuation.value} ${req.body.coinName}. Please provide an EVM address to The Concierge to receive your payout.`
			}
		} else {
			data.message = `One of your messages has been valuated with ${valuation.value} ${req.body.coinName}. Please verify your credentials to The Concierge to receive your payout.`
		}

		res.send(data)
	} catch (err) {
		res.status(500).send({
			message: `Error on inserting valuation`
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
		const result = await Valuation.find(req.body)
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
		const result = await Valuation.findOne(req.body)
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
		const result = await Valuation.getAll(options)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving valuations."
		})
	}
}

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
		const result = await Valuation.getAllPublic(options)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving valuations."
		})
	}
}