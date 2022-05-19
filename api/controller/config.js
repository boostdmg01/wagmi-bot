const Config = require("../model/config.js")
const io = require("../lib/io").getIO()

exports.update = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	try {
		const result = await Config.update(req.body)
		io.emit("update")
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message: "Error updating config"
		})
	}
}

exports.verification = async (req, res) => {
	io.emit("verification")
	res.send({ message: 'Verification Post reset! ' })
}

exports.find = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Invalid payload"
		})
	}

	try {
		const result = await Config.find(req.body)
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving the config."
		})
	}
}

exports.getAll = async (req, res) => {
	try {
		const result = await Config.getAll()
		res.send(result)
	} catch (err) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while retrieving the config."
		})
	}
}