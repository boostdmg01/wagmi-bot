const sql = require("../lib/sql.js")

const User = function (user) {
	if (typeof user === "undefined") {
		user = {}
	}

	this.id = user.id || null
	this.evmAddress = user.evmAddress || null
	this.substrateAddress = user.substrateAddress || null
	this.twitterHandle = user.twitterHandle || null
}

User.insertOrUpdate = async (user) => {
	try {
		let [rows] = await sql.execute("SELECT id FROM user WHERE id = ?", [user.id])
		if (rows.length === 0) {
			await sql.execute("INSERT INTO user (id) VALUES (?)", [user.id])
		}

		let sqlUpdateStatement = []
		let sqlUpdateValues = []
		for (let key in user) {
			if (key === 'id' || user[key] === null) {
				continue
			}

			sqlUpdateStatement.push(`${key} = ?`)
			sqlUpdateValues.push(user[key])
		}
		sqlUpdateValues.push(user.id)

		await sql.execute(`UPDATE user SET ${sqlUpdateStatement} WHERE id = ?`, sqlUpdateValues)

		console.log("User updated: ", user)
		return { status: 200, message: "User updated" }
	} catch (err) {
		console.log("Error on user update:", err)
		throw err
	}
}

User.getAll = async (options) => {
	let defaults = {
		paginated: false,
		sortField: 'id',
		sortOrder: 'ASC',
		pageNo: 1,
		pageSize: 15,
	}

	let _options = Object.assign({}, defaults, options)

	let limit = ""
	if (_options.paginated) {
		limit = `LIMIT ${_options.pageSize} OFFSET ${((_options.pageNo - 1) * _options.pageSize)}`
	}

	try {
		let [rows] = await sql.query(`SELECT * FROM user ORDER BY ${_options.sortField} ${_options.sortOrder} ${limit}`)

		if (!_options.paginated) {
			return rows
		} else {
			let [counter] = await sql.execute("SELECT COUNT(*) AS count FROM user")

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
		console.log("Error querying user")
		throw err
	}
}

User.getById = async (id) => {
	try {
		let [rows] = await sql.execute("SELECT * FROM user WHERE id = ? LIMIT 1", [id])

		if (rows.length == 1) {
			return new User(rows[0])
		} else {
			return new User()
		}
	} catch (err) {
		console.log("Error querying user")
		throw err
	}
}

module.exports = User