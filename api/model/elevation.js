const sql = require("../lib/sql.js")

const Elevation = function (elevation = {}) {
	this.oldMessageId = elevation.oldMessageId || null
	this.oldChannelId = elevation.oldChannelId || null
	this.newMessageId = elevation.newMessageId || null
	this.newChannelId = elevation.newChannelId || null
	this.timestamp = elevation.timestamp || null
}

Elevation.insert = async (elevation) => {
	try {
		await sql.execute("INSERT INTO elevation (oldMessageId, oldChannelId, newMessageId, newChannelId, timestamp) VALUES (?, ?, ?, ?, ?)", [
			elevation.oldMessageId,
			elevation.oldChannelId,
			elevation.newMessageId,
			elevation.newChannelId,
			Math.floor(Date.now() / 1000)
		])

		console.log("Elevation inserted: ", elevation)
		return { status: 200, message: "Elevation inserted" }
	} catch (err) {
		console.log("Error on elevation insert:", err)
		throw err
	}
}

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
		console.log("Error querying elevations")
		throw err
	}
}

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
		console.log("Error querying elevations")
		throw err
	}
}

Elevation.getAll = async (options) => {
	let defaults = {
		searchFilter: '',
		paginated: false,
		sortField: 'timestamp',
		sortOrder: 'DESC',
		pageNo: 1,
		pageSize: 15,
	}

	let _options = Object.assign({}, defaults, options)

	let limit = where = ""
	if (_options.paginated) {
		limit = `LIMIT ${_options.pageSize} OFFSET ${((_options.pageNo - 1) * _options.pageSize)}`
	}

	try {
		let [rows] = await sql.query(`SELECT * FROM elevation ${where} ORDER BY ${_options.sortField} ${_options.sortOrder} ${limit}`)

		if (!_options.paginated) {
			return rows
		} else {
			let [counter] = await sql.execute(`SELECT COUNT(*) AS count FROM elevation ${where}`)

			let to = _options.pageNo * _options.pageSize

			return {
				total: counter[0].count,
				from: counter[0].count ? ((_options.pageNo - 1) * _options.pageSize) + 1 : 0,
				to: to < counter[0].count ? to : counter[0].count,
				last_page: Math.ceil(counter[0].count / _options.pageSize),
				per_page: _options.pageSize,
				current_page: _options.pageNo,
				data: rows
			}
		}
	} catch (err) {
		console.log("Error querying elevations")
		throw err
	}
}

module.exports = Elevation