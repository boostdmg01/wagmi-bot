const sql = require("../lib/sql.js")

const Config = function () { }

/**
 * Update configuration values
 * 
 * @param {object} config - object containing configuration keys and values
 * @returns {object} - result object
 */
Config.update = async (config) => {
	try {
		for (let name in config) {
			await sql.execute("UPDATE config SET value = ? WHERE name = ?", [config[name], name])
		}
		
		return { status: 200, message: "Config updated" }
	} catch (err) {
		throw err
	}
}

/**
 * Find configuration values based on their keys
 * 
 * @param {array} - array containing keys of the requested configuration values 
 * @returns {object} - object of configuration values
 */
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
		throw err
	}
}

/**
 * Get all configuration values 
 * 
 * @returns {object} - object of configuration values
 */
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
		throw err
	}
}

module.exports = Config