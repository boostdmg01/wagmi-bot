module.exports = (app) => {
	var router = require("express").Router()

	const config = require("./controller/config.js")
	router.get("/api/config/all", config.getAll)
	router.post("/api/config/update", config.update)
	router.post("/api/config/find", config.find)
	router.get("/api/config/verification", config.verification)


	const user = require("./controller/user.js")
	router.post("/api/user/insertOrUpdate", user.insertOrUpdate)
	router.get("/api/user/all", user.getAll)
	router.get("/api/user/:id", user.getById)


	const discord = require("./controller/discord.js")
	router.get("/api/discord/channels", discord.getChannels)
	router.get("/api/discord/roles", discord.getRoles)
	router.get("/api/discord/emojis", discord.getEmojis)
	router.get("/api/discord/members", discord.getMembers)
	router.get("/api/discord/login", discord.login)
	router.get("/api/discord/logout", discord.logout)
	router.get("/api/discord/clear", discord.clear)
	router.get("/api/discord/data", discord.data)


	const treasury = require("./controller/treasury.js")
	router.post("/api/treasury/insert", treasury.insert)
	router.delete("/api/treasury/delete/:id", treasury.delete)
	router.put("/api/treasury/update/:id", treasury.update)
	router.get("/api/treasury/all", treasury.getAll)
	router.get("/api/treasury/public", treasury.getAllPublic)
	router.get("/api/treasury/:id", treasury.getById)

	const emoji = require("./controller/emoji.js")
	router.post("/api/emoji/insert", emoji.insert)
	router.delete("/api/emoji/delete/:id", emoji.delete)
	router.put("/api/emoji/update/:id", emoji.update)
	router.get("/api/emoji/all", emoji.getAll)
	router.get("/api/emoji/:id", emoji.getById)


	const elevation = require("./controller/elevation.js")
	router.post("/api/elevation/insert", elevation.insert)
	router.post("/api/elevation/find", elevation.find)
	router.post("/api/elevation/findOne", elevation.findOne)


	const valuation = require("./controller/valuation.js")
	router.post("/api/valuation/insert", valuation.insert)
	router.get("/api/valuation/all", valuation.getAll)
	router.get("/api/valuation/export", valuation.export)
	router.get("/api/valuation/public", valuation.getAllPublic)
	router.post("/api/valuation/findOne", valuation.findOne)
	router.delete("/api/valuation/delete/:id", valuation.delete)

	app.use(router)
}