const sql = require("../lib/sql.js")

/**
 * Entity instance for a message valuation
 * 
 * @param {object} valuation - valuation data
 */
const Valuation = function (valuation = {}) {
	this.id = valuation.id || null
	this.messageId = valuation.messageId || null
	this.discordEmojiId = valuation.discordEmojiId || null
	this.treasuryId = valuation.treasuryId || null
	this.userId = valuation.userId || null
	this.username = valuation.username || null
	this.timestamp = valuation.timestamp || null
	this.value = valuation.value || null
	this.messageLink = valuation.messageLink || null
	this.transactionHash = valuation.transactionHash || null
	this.status = valuation.status || 1
	this.transactionTimestamp = valuation.transactionTimestamp || null
	this.royaltyValue = valuation.royaltyValue || null
	this.royaltyTransactionHash = valuation.royaltyTransactionHash || null
	this.royaltyTransactionTimestamp = valuation.royaltyTransactionTimestamp || null
	this.royaltyStatus = valuation.royaltyStatus || 1
	this.source = valuation.source || null
	this.minBalanceBumped = valuation.minBalanceBumped || 0
	this.sentExistentialDeposit = valuation.sentExistentialDeposit || 0
	this.royaltyMinBalanceBumped = valuation.royaltyMinBalanceBumped || 0
	this.royaltySentExistentialDeposit = valuation.royaltySentExistentialDeposit || 0
	this.content = valuation.content || null
	this.awarderId = valuation.awarderId || null
	this.awarderUsername = valuation.awarderUsername || null
}

/**
 * Insert message valuation
 * 
 * @param {Valuation} valuation - message valuation instance
 * @returns {object} - result object
 */
Valuation.insert = async (valuation) => {
	try {
		await sql.execute("INSERT INTO valuation (messageId, discordEmojiId, treasuryId, userId, username, timestamp, value, messageLink, status, royaltyValue, source, awarderId, awarderUsername) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
			valuation.messageId,
			valuation.discordEmojiId,
			valuation.treasuryId,
			valuation.userId,
			valuation.username,
			valuation.timestamp,
			valuation.value,
			valuation.messageLink,
			valuation.status,
			valuation.royaltyValue,
			valuation.source,
			valuation.awarderId,
			valuation.awarderUsername
		])

		/** Check if content already tracked, insert otherwise **/
		let [rows] = await sql.query(`SELECT messageId FROM valuation_content WHERE messageId = ? LIMIT 1`, [valuation.messageId])

		if (rows.length == 0) {
			await sql.execute("INSERT INTO valuation_content (messageId, content, timestamp) VALUES (?, ?, ?)", [
				valuation.messageId,
				valuation.content,
				valuation.timestamp
			])
		}

		return { status: 200, message: "Valuation inserted" }
	} catch (err) {
		throw err
	}
}

/**
 * Find message valuation based on conditions
 * 
 * @param {object} options - conditions
 * @return {Valuation} - result as message valuation instance
 */
Valuation.findOne = async (options) => {
	let where = []
	let values = []

	for (let key in options) {
		where.push(`${key} = ?`)
		values.push(options[key])
	}

	try {
		let [rows] = await sql.query(`SELECT * FROM valuation WHERE ${where.join(' AND ')} LIMIT 1`, values)

		if (rows.length == 1) {
			return new Valuation(rows[0])
		} else {
			return new Valuation()
		}
	} catch (err) {
		throw err
	}
}

/**
 * Query all message valuations
 * 
 * @param {object} options - query options
 * @return {array} - query results
 */
Valuation.getAll = async (options) => {
	let defaults = {
		searchFilter: null,
		paginated: false,
		export: false,
		sortField: 'valuation.timestamp',
		sortOrder: 'DESC',
		pageNo: 1,
		pageSize: 15,
	}

	let _options = Object.assign({}, defaults, options)

	let limit = ''
	let where = ['1=1']
	let bindings = []
	if (_options.paginated) {
		limit = `LIMIT ${_options.pageSize} OFFSET ${((_options.pageNo - 1) * _options.pageSize)}`
	}

	if (_options.searchFilter !== null) {
		if (_options.searchFilter.dateStart) {
			where.push(`valuation.timestamp >= ?`)
			bindings.push(_options.searchFilter.dateStart)
		}

		if (_options.searchFilter.dateEnd) {
			where.push(`valuation.timestamp <= ?`)
			bindings.push(_options.searchFilter.dateEnd)
		}

		if (_options.searchFilter.treasuryId) {
			where.push(`valuation.treasuryId = ?`)
			bindings.push(_options.searchFilter.treasuryId)
		}

		if (_options.searchFilter.status) {
			if (_options.searchFilter.status === 1) {
				where.push(`(valuation.status = 1 OR (valuation.royaltyValue IS NOT NULL AND valuation.royaltyStatus = 1))`)
			} else if (_options.searchFilter.status === 2) {
				where.push(`(valuation.status = 2 OR (valuation.royaltyValue IS NOT NULL AND valuation.royaltyStatus = 2))`)
			} else {
				where.push(`(valuation.status > 2 OR (valuation.royaltyValue IS NOT NULL AND valuation.royaltyStatus > 2))`)
			}
		}
	}

	try {
		let selection = `valuation.*, treasury.coinName, treasury.name, IF(treasury.type = 'substrate', IF(treasury.parachainType > 0, 1, 0), 0) AS hasAsset, treasury.explorerUrl`
		if (_options.export) {
			selection = `valuation.*, treasury.coinName, treasury.name, valuation_content.content, treasury.explorerUrl`
		}

		let [rows] = await sql.query(`SELECT ${selection} FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) LEFT JOIN valuation_content ON (valuation.messageId = valuation_content.messageId) WHERE ${(() => where.join(' AND '))()} ORDER BY ${_options.sortField} ${_options.sortOrder} ${limit}`, bindings)

		if (!_options.paginated) {
			return rows
		} else {
			let [counter] = await sql.execute(`SELECT COUNT(*) AS count FROM valuation WHERE ${(() => where.join(' AND '))()}`, bindings)

			let to = _options.pageNo * _options.pageSize

			let [stats] = await sql.execute(`SELECT COUNT(*) AS count, SUM(valuation.value) as total, treasury.name FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) WHERE ${(() => where.join(' AND '))()} GROUP BY valuation.treasuryId`, bindings)

			return {
				total: counter[0].count,
				from: counter[0].count ? ((_options.pageNo - 1) * _options.pageSize) + 1 : 0,
				to: to < counter[0].count ? to : counter[0].count,
				last_page: Math.ceil(counter[0].count / _options.pageSize),
				per_page: _options.pageSize,
				current_page: _options.pageNo,
				stats: stats,
				data: rows
			}
		}
	} catch (err) {
		throw err
	}
}

/**
 * Query all message valuations without sensitive data
 * 
 * @param {object} options - query options
 * @return {array} - query results
 */
Valuation.getAllPublic = async (options) => {
	let defaults = {
		searchFilter: null,
		paginated: false,
		sortField: 'valuation.timestamp',
		sortOrder: 'DESC',
		pageNo: 1,
		pageSize: 15,
	}

	let _options = Object.assign({}, defaults, options)

	let limit = ''
	let where = ['1=1']
	let bindings = []
	if (_options.paginated) {
		limit = `LIMIT ${_options.pageSize} OFFSET ${((_options.pageNo - 1) * _options.pageSize)}`
	}

	if (_options.searchFilter !== null) {
		if (_options.searchFilter.dateStart) {
			where.push(`valuation.timestamp >= ?`)
			bindings.push(_options.searchFilter.dateStart)
		}

		if (_options.searchFilter.dateEnd) {
			where.push(`valuation.timestamp <= ?`)
			bindings.push(_options.searchFilter.dateEnd)
		}

		if (_options.searchFilter.treasuryId) {
			where.push(`valuation.treasuryId = ?`)
			bindings.push(_options.searchFilter.treasuryId)
		}

		if (_options.searchFilter.status) {
			if (_options.searchFilter.status === 1) {
				where.push(`(valuation.status = 1 OR (valuation.royaltyValue IS NOT NULL AND valuation.royaltyStatus = 1))`)
			} else if (_options.searchFilter.status === 2) {
				where.push(`(valuation.status = 2 OR (valuation.royaltyValue IS NOT NULL AND valuation.royaltyStatus = 2))`)
			} else {
				where.push(`(valuation.status > 2 OR (valuation.royaltyValue IS NOT NULL AND valuation.royaltyStatus > 2))`)
			}
		}
	}

	try {
		let [rows] = await sql.query(`SELECT valuation.id, valuation.value, valuation.status, valuation.messageLink, valuation.awarderUsername, valuation.transactionHash, valuation.timestamp, valuation.source, treasury.coinName, treasury.name, IF(treasury.type = 'substrate', IF(treasury.parachainType > 0, 1, 0), 0) AS hasAsset, treasury.explorerUrl FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) WHERE ${(() => where.join(' AND '))()} ORDER BY ${_options.sortField} ${_options.sortOrder} ${limit}`, bindings)

		if (!_options.paginated) {
			return rows
		} else {
			let [counter] = await sql.execute(`SELECT COUNT(*) AS count FROM valuation WHERE ${(() => where.join(' AND '))()}`, bindings)

			let to = _options.pageNo * _options.pageSize

			let [stats] = await sql.execute(`SELECT COUNT(*) AS count, SUM(valuation.value) as total, treasury.name FROM valuation LEFT JOIN treasury ON (treasury.id = valuation.treasuryId) WHERE ${(() => where.join(' AND '))()} GROUP BY valuation.treasuryId`, bindings)

			return {
				total: counter[0].count,
				from: counter[0].count ? ((_options.pageNo - 1) * _options.pageSize) + 1 : 0,
				to: to < counter[0].count ? to : counter[0].count,
				last_page: Math.ceil(counter[0].count / _options.pageSize),
				per_page: _options.pageSize,
				current_page: _options.pageNo,
				stats: stats,
				data: rows
			}
		}
	} catch (err) {
		throw err
	}
}

/**
 * Delete valuation
 * 
 * @param {number} id - valuation id
 * @returns {object} - result object
 */
 Valuation.delete = async (id) => {
	try {
		let [valuation] = await sql.query(`SELECT messageId FROM valuation WHERE id = ? LIMIT 1`, [id])

		await sql.execute("DELETE FROM valuation WHERE id = ?", [id])

		let [contentRows] = await sql.query(`SELECT id FROM valuation WHERE messageId = ?`, [valuation[0].messageId])

		if (contentRows.length == 0) {
			await sql.execute("DELETE FROM valuation_content WHERE messageId = ?", [valuation[0].messageId])
		}

		return { status: 200, message: "Valuation deleted" }
	} catch (err) {
		throw err
	}
}

/**
 * Prune valuation content
 */
 Valuation.pruneContent = async () => {
	try {
		const timestamp = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)

		await sql.execute("DELETE FROM valuation_content WHERE timestamp > ?", [timestamp])
	} catch (err) {
		throw err
	}
}

module.exports = Valuation