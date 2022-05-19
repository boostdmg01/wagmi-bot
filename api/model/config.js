const sql = require("../lib/sql.js")

const Config = function () { }

Config.update = async (config) => {
	try {
		for (let name in config) {
			await sql.execute("UPDATE config SET value = ? WHERE name = ?", [config[name], name])
		}

		console.log("Config updated: ", config)
		return { status: 200, message: "Config updated" }
	} catch (err) {
		console.log("Error on config update:", err)
		throw err
	}
}

Config.find = async (keys) => {
	try {
		let [rows] = await sql.query("SELECT * FROM config WHERE name IN (?)", [keys])

		let config = {}
		for (let row of rows) {
			switch (row.type) {
				case "string[]":
					config[row.name] = row.value.split(",")
					break
				case "integer[]":
					config[row.name] = row.value.split(",").map(x => parseInt(x))
					break
				case "integer":
					config[row.name] = parseInt(row.value)
					break
				default:
					config[row.name] = row.value
					break
			}
		}

		return config
	} catch (err) {
		console.log("Error querying config")
		throw err
	}
}

Config.getAll = async () => {
	try {
		let [rows] = await sql.query("SELECT * FROM config")

		let config = {}
		for (let row of rows) {
			switch (row.type) {
				case "string[]":
					config[row.name] = row.value.split(",")
					break
				case "integer[]":
					config[row.name] = row.value.split(",").map(x => parseInt(x))
					break
				case "integer":
					config[row.name] = parseInt(row.value)
					break
				default:
					config[row.name] = row.value
					break
			}
		}

		return config
	} catch (err) {
		console.log("Error querying config")
		throw err
	}
}

module.exports = Config