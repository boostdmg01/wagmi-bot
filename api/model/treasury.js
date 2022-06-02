const sql = require("../lib/sql")
const crypto = require("../lib/crypto")

const Treasury = function (treasury) {
	if (typeof treasury === "undefined") {
		treasury = {}
	}

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
	this.chainTypes = treasury.chainTypes || null
	this.royalityEnabled = treasury.royalityEnabled || 0
	this.royalityAddress = treasury.royalityAddress || null
	this.royalityPercentage = treasury.royalityPercentage || null
	this.assetId = treasury.assetId || null
	this.sendMinBalance = treasury.sendMinBalance || 1
	this.sendExistentialDeposit = treasury.sendExistentialDeposit || 0
	this.parachainType = treasury.parachainType || 0
	this.encryptionKey = treasury.encryptionKey || null
}

Treasury.insert = async (treasury) => {
	try {
		if (treasury.privateKey !== null && treasury.privateKey !== "") {
			treasury.privateKey = crypto.encrypt(treasury.privateKey, treasury.encryptionKey)
		}
		if (treasury.mnemonic !== null && treasury.mnemonic !== "") {
			treasury.mnemonic = crypto.encrypt(treasury.mnemonic, treasury.encryptionKey)
		}

		await sql.execute("INSERT INTO treasury (name, elevationActive, elevationChannelId, elevationEmojiId, elevationAmount, type, rpcUrl, chainPrefix, mnemonic, chainTypes, privateKey, isNative, tokenAddress, tokenDecimals, coinName, royalityAddress, royalityEnabled, royalityPercentage, assetId, sendMinBalance, sendExistentialDeposit, parachainType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
			treasury.name,
			treasury.elevationActive,
			treasury.elevationChannelId,
			treasury.elevationEmojiId,
			treasury.elevationAmount,
			treasury.type,
			treasury.rpcUrl,
			treasury.chainPrefix,
			treasury.mnemonic,
			treasury.chainTypes,
			treasury.privateKey,
			treasury.isNative,
			treasury.tokenAddress,
			treasury.tokenDecimals,
			treasury.coinName,
			treasury.royalityAddress,
			treasury.royalityEnabled,
			treasury.royalityPercentage,
			treasury.assetId,
			treasury.sendMinBalance,
			treasury.sendExistentialDeposit,
			treasury.parachainType,
		])

		console.log("Treasury inserted: ", treasury)
		return { status: 200, message: "Treasury inserted" }
	} catch (err) {
		console.log("Error on treasury insert:", err)
		throw err
	}
}

Treasury.update = async (id, treasury) => {
	try {
		if (treasury.privateKey !== null && treasury.privateKey !== "") {
			treasury.privateKey = crypto.encrypt(treasury.privateKey, treasury.encryptionKey)
		}
		if (treasury.mnemonic !== null  && treasury.mnemonic !== "") {
			treasury.mnemonic = crypto.encrypt(treasury.mnemonic, treasury.encryptionKey)
		}

		await sql.execute("UPDATE treasury SET name = ?, elevationActive = ?, elevationChannelId = ?, elevationEmojiId = ?, elevationAmount = ?, type = ?, rpcUrl = ?, chainPrefix = ?, mnemonic = ?, chainTypes = ?, privateKey = ?, isNative = ?, tokenAddress = ?, tokenDecimals = ?, coinName = ?, royalityAddress = ?, royalityEnabled = ?, royalityPercentage = ?, assetId = ?, sendMinBalance = ?, sendExistentialDeposit = ?, parachainType = ? WHERE id = ?", [
			treasury.name,
			treasury.elevationActive,
			treasury.elevationChannelId,
			treasury.elevationEmojiId,
			treasury.elevationAmount,
			treasury.type,
			treasury.rpcUrl,
			treasury.chainPrefix,
			treasury.mnemonic,
			treasury.chainTypes,
			treasury.privateKey,
			treasury.isNative,
			treasury.tokenAddress,
			treasury.tokenDecimals,
			treasury.coinName,
			treasury.royalityAddress,
			treasury.royalityEnabled,
			treasury.royalityPercentage,
			treasury.assetId,
			treasury.sendMinBalance,
			treasury.sendExistentialDeposit,
			treasury.parachainType,
			id
		])

		console.log("Treasury updated: ", treasury)
		return { status: 200, message: "Treasury updated" }
	} catch (err) {
		console.log("Error on treasury update:", err)
		throw err
	}
}

Treasury.delete = async (id) => {
	try {
		await sql.execute("DELETE FROM treasury WHERE id = ?", [id])

		console.log("Treasury deleted: ", id)
		return { status: 200, message: "Treasury deleted" }
	} catch (err) {
		console.log("Error on treasury delete:", err)
		throw err
	}
}

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
		console.log("Error querying treasuries")
		throw err
	}
}

Treasury.getAllPublic = async () => {
	try {
		let [rows] = await sql.query(`SELECT id, name FROM treasury ORDER BY name ASC`)

		return rows
	} catch (err) {
		console.log("Error querying treasuries")
		throw err
	}
}

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
		console.log("Error querying treasury")
		throw err
	}
}

module.exports = Treasury