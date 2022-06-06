const sql = require("../lib/sql.js")

/**
 * Entity instance for an elevation
 * 
 * @param {object} elevation - elevation data
 */
const Elevation = function (elevation = {}) {
	this.oldMessageId = elevation.oldMessageId || null
	this.oldChannelId = elevation.oldChannelId || null
	this.newMessageId = elevation.newMessageId || null
	this.newChannelId = elevation.newChannelId || null
	this.userId = elevation.userId || null
	this.username = elevation.username || null
	this.timestamp = elevation.timestamp || null
}

/**
 * Insert post elevation
 * 
 * @param {Elevation} - elevation instance
 * @returns {object} - result object
 */
Elevation.insert = async (elevation) => {
	try {
		await sql.execute("INSERT INTO elevation (oldMessageId, oldChannelId, newMessageId, newChannelId, userId, username, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)", [
			elevation.oldMessageId,
			elevation.oldChannelId,
			elevation.newMessageId,
			elevation.newChannelId,
			elevation.userId,
			elevation.username,
			Math.floor(Date.now() / 1000)
		])

		return { status: 200, message: "Elevation inserted" }
	} catch (err) {
		throw err
	}
}

/**
 * Find elevations based on multiple conditions.
 * 
 * @param {object} options - nested conditions
 * @return {array} - query results
 */
Elevation.find = async (options) => {
	let where = []
	let values = []

	for (let option of options) {
		let condition = []
		for (let key in option) {
			condition.push(`${key} = ?`)
			values.push(option[key])
		}

		where.push(condition.join(' AND '))
	}

	try {
		let [rows] = await sql.query(`SELECT * FROM elevation WHERE ${where.join(' OR ')}`, values)
		return rows
	} catch (err) {
		throw err
	}
}

/**
 * Find elevation based on conditions
 * 
 * @param {object} options - conditions
 * @return {Elevation} - result as elevation instance
 */
Elevation.findOne = async (options) => {
	let where = []
	let values = []

	for (let key in options) {
		where.push(`${key} = ?`)
		values.push(options[key])
	}

	try {
		let [rows] = await sql.query(`SELECT * FROM elevation WHERE ${where.join(' AND ')} LIMIT 1`, values)

		if (rows.length == 1) {
			return new Elevation(rows[0])
		} else {
			return new Elevation()
		}
	} catch (err) {
		throw err
	}
}

module.exports = Elevation