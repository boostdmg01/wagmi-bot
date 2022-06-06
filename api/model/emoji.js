const sql = require("../lib/sql.js")

/**
 * Entity instance for an emoji
 * 
 * @param {object} emoji - emoji data
 */
const Emoji = function (emoji = {}) {
	this.id = emoji.id || null
	this.treasuryId = emoji.treasuryId || null
	this.emojiId = emoji.emojiId || null
	this.amount = emoji.amount || 0
}

/**
 * Insert emoji
 * 
 * @param {Emoji} emoji - emoji instance
 * @returns {object} - result object
 */
Emoji.insert = async (emoji) => {
	try {
		await sql.execute("INSERT INTO emoji (treasuryId, emojiId, amount) VALUES (?, ?, ?)", [
			emoji.treasuryId,
			emoji.emojiId,
			emoji.amount
		])

		return { status: 200, message: "Emoji inserted" }
	} catch (err) {
		throw err
	}
}

/**
 * Update emoji
 * 
 * @param {number} id - emoji id
 * @param {Emoji} emoji - emoji instance
 * @returns {object} - result object
 */
Emoji.update = async (id, emoji) => {
	try {
		await sql.execute("UPDATE emoji SET treasuryId = ?, emojiId = ?, amount = ? WHERE id = ?", [
			emoji.treasuryId,
			emoji.emojiId,
			emoji.amount,
			id
		])

		return { status: 200, message: "Emoji updated" }
	} catch (err) {
		throw err
	}
}

/**
 * Delete emoji
 * 
 * @param {number} id - emoji id
 * @returns {object} - result object
 */
Emoji.delete = async (id) => {
	try {
		await sql.execute("DELETE FROM emoji WHERE id = ?", [id])

		return { status: 200, message: "Emoji deleted" }
	} catch (err) {
		throw err
	}
}

/**
 * Query all emojis
 * 
 * @param {object} options - query options
 * @return {array} - query results
 */
Emoji.getAll = async (options) => {
	let defaults = {
		searchFilter: '',
		paginated: false,
		sortField: 'treasury.name',
		sortOrder: 'ASC',
		pageNo: 1,
		pageSize: 15,
	}

	let _options = Object.assign({}, defaults, options)

	let limit = where = ""
	if (_options.paginated) {
		limit = `LIMIT ${_options.pageSize} OFFSET ${((_options.pageNo - 1) * _options.pageSize)}`
	}

	if (_options.searchFilter !== "") {
		where = `WHERE treasury.name LIKE '%${_options.searchFilter}%' OR emoji.amount LIKE '${_options.searchFilter}%'`
	}

	try {
		let [rows] = await sql.query(`SELECT emoji.*, treasury.name, treasury.type, treasury.coinName, treasury.royaltyEnabled, treasury.royaltyPercentage FROM emoji LEFT JOIN treasury ON (treasury.id = emoji.treasuryId) ${where} ORDER BY ${_options.sortField} ${_options.sortOrder} ${limit}`)

		if (!_options.paginated) {
			return rows
		} else {
			let [counter] = await sql.execute(`SELECT COUNT(*) AS count FROM emoji ${where}`)

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
		throw err
	}
}

/**
 * Query emoji by id
 * 
 * @param {number} id - emoji id
 * @return {Emoji} - result as emoji instance
 */
Emoji.getById = async (id) => {
	try {
		let [rows] = await sql.execute("SELECT * FROM emoji WHERE id = ? LIMIT 1", [id])

		if (rows.length == 1) {
			return new Emoji(rows[0])
		} else {
			return new Emoji()
		}
	} catch (err) {
		throw err
	}
}

module.exports = Emoji