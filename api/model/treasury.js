const sql = require("../lib/sql")
const crypto = require("../lib/crypto")

/**
 * Treasury instance for a treasury
 * 
 * @param {object} treasury - treasury data
 */
const Treasury = function (treasury = {}) {
	this.id = treasury.id || null
	this.name = treasury.name || null
	this.coinName = treasury.coinName || null
	this.elevationActive = treasury.elevationActive || 0
	this.elevationChannelId = treasury.elevationChannelId || null
	this.elevationEmojiId = treasury.elevationEmojiId || null
	this.elevationAmount = treasury.elevationAmount || 0
	this.type = treasury.type || null
	this.rpcUrl = treasury.rpcUrl || null
	this.chainPrefix = treasury.chainPrefix || null
	this.isNative = treasury.isNative || 0
	this.tokenAddress = treasury.tokenAddress || null
	this.tokenDecimals = treasury.tokenDecimals || null
	this.privateKey = treasury.privateKey || null
	this.mnemonic = treasury.mnemonic || null
	this.chainOptions = treasury.chainOptions || null
	this.royaltyEnabled = treasury.royaltyEnabled || 0
	this.royaltyAddress = treasury.royaltyAddress || null
	this.royaltyPercentage = treasury.royaltyPercentage || null
	this.assetId = treasury.assetId || null
	this.sendMinBalance = treasury.sendMinBalance || 1
	this.sendExistentialDeposit = treasury.sendExistentialDeposit || 0
	this.parachainType = treasury.parachainType || 0
	this.encryptionKey = treasury.encryptionKey || null
}

/**
 * Insert treasury
 * 
 * @param {Treasury} treasury - treasury instance
 * @returns {object} - result object
 */
Treasury.insert = async (treasury) => {
	try {
		if (treasury.privateKey !== null && treasury.privateKey !== "") {
			treasury.privateKey = crypto.encrypt(treasury.privateKey, treasury.encryptionKey)
		}
		if (treasury.mnemonic !== null && treasury.mnemonic !== "") {
			treasury.mnemonic = crypto.encrypt(treasury.mnemonic, treasury.encryptionKey)
		}

		await sql.execute("INSERT INTO treasury (name, elevationActive, elevationChannelId, elevationEmojiId, elevationAmount, type, rpcUrl, chainPrefix, mnemonic, chainOptions, privateKey, isNative, tokenAddress, tokenDecimals, coinName, royaltyAddress, royaltyEnabled, royaltyPercentage, assetId, sendMinBalance, sendExistentialDeposit, parachainType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
			treasury.name,
			treasury.elevationActive,
			treasury.elevationChannelId,
			treasury.elevationEmojiId,
			treasury.elevationAmount,
			treasury.type,
			treasury.rpcUrl,
			treasury.chainPrefix,
			treasury.mnemonic,
			treasury.chainOptions,
			treasury.privateKey,
			treasury.isNative,
			treasury.tokenAddress,
			treasury.tokenDecimals,
			treasury.coinName,
			treasury.royaltyAddress,
			treasury.royaltyEnabled,
			treasury.royaltyPercentage,
			treasury.assetId,
			treasury.sendMinBalance,
			treasury.sendExistentialDeposit,
			treasury.parachainType,
		])

		return { status: 200, message: "Treasury inserted" }
	} catch (err) {
		throw err
	}
}

/**
 * Update treasury
 * 
 * @param {number} id - treasury id
 * @param {Treasury} treasury - treasury instance
 * @returns {object} - result object
 */
Treasury.update = async (id, treasury) => {
	try {
		let bindingKeys = [
			'name',
			'elevationActive',
			'elevationChannelId',
			'elevationEmojiId',
			'elevationAmount',
			'type',
			'rpcUrl',
			'chainPrefix',
			'chainOptions',
			'isNative',
			'tokenAddress',
			'tokenDecimals',
			'coinName',
			'royaltyAddress',
			'royaltyEnabled',
			'royaltyPercentage',
			'assetId',
			'sendMinBalance',
			'sendExistentialDeposit',
			'parachainType',
		]

		/** Do not update privateKey and mnemonic if not set */
		if (treasury.privateKey !== null && treasury.privateKey !== "") {
			treasury.privateKey = crypto.encrypt(treasury.privateKey, treasury.encryptionKey)
			bindingKeys.push('privateKey')
		}
		if (treasury.mnemonic !== null  && treasury.mnemonic !== "") {
			treasury.mnemonic = crypto.encrypt(treasury.mnemonic, treasury.encryptionKey)
			bindingKeys.push('mnemonic')
		}

		await sql.execute(`UPDATE treasury SET ${bindingKeys.map(e => e + ' = ?' ).join(", ")} WHERE id = ?`, [ ... bindingKeys.map(e => treasury[e]), treasury.id ])

		return { status: 200, message: "Treasury updated" }
	} catch (err) {
		throw err
	}
}

/**
 * Delete treasury
 * 
 * @param {number} id - treasury id
 * @returns {object} - result object
 */
Treasury.delete = async (id) => {
	try {
		await sql.execute("DELETE FROM treasury WHERE id = ?", [id])

		return { status: 200, message: "Treasury deleted" }
	} catch (err) {
		throw err
	}
}

/**
 * Query all treasuries
 * 
 * @param {object} options - query options
 * @return {array} - query results
 */
Treasury.getAll = async (options) => {
	let defaults = {
		searchFilter: '',
		paginated: false,
		sortField: 'name',
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
		where = `WHERE name LIKE '%${_options.searchFilter}%'`
	}

	try {
		let [rows] = await sql.query(`SELECT * FROM treasury ${where} ORDER BY ${_options.sortField} ${_options.sortOrder} ${limit}`)

		rows.map(e => {
			delete e.privateKey;
			delete e.mnemonic;
		})
		if (!_options.paginated) {
			return rows
		} else {
			let [counter] = await sql.execute(`SELECT COUNT(*) AS count FROM treasury ${where}`)

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
 * Query all treasuries valuations without sensitive data
 * 
 * @param {object} options - query options
 * @return {array} - query results
 */
Treasury.getAllPublic = async () => {
	try {
		let [rows] = await sql.query(`SELECT id, name FROM treasury ORDER BY name ASC`)

		return rows
	} catch (err) {
		throw err
	}
}

/**
 * Query treasury by id
 * 
 * @param {number} id - treasury id
 * @return {Treasury} - result as treasury instance
 */
Treasury.getById = async (id) => {
	try {
		let [rows] = await sql.execute("SELECT * FROM treasury WHERE id = ? LIMIT 1", [id])

		rows.map(e => {
			delete e.privateKey;
			delete e.mnemonic;
		})

		if (rows.length == 1) {
			return new Treasury(rows[0])
		} else {
			return new Treasury()
		}
	} catch (err) {
		throw err
	}
}

module.exports = Treasury