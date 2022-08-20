const axios = require("axios")
const cache = require("../lib/cache")
const logger = require("../lib/logger")

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Remap Discord channels to a more readable format including parent channels
 * 
 * @param {array} data - Discord channels
 * 
 * @returns {array}
 */
const remapChannels = (data) => {
	let remapped = []

	for (let channel of data) {
		if (channel.parent_id) {
			let parent_channel = data.find(e => e.id === channel.parent_id)

			if (parent_channel) {
				channel.name = `${parent_channel.name} // #${channel.name}`
			} else {
				channel.name = `#${channel.name}`
			}
		} else {
			if (channel.type !== 4) {
				channel.name = `#${channel.name}`
			}
		}

		remapped.push(channel)
	}

	return remapped
}

const checkRateLimit = async headers => {
    let delayTime = 0
    if (parseInt(headers['x-ratelimit-remaining']) <= 0) {
        delayTime = parseInt(headers['x-ratelimit-reset-after']) * 1000
    }
    
    await delay(delayTime)
}

/**
 * Return cached Discord channels of application guild and return them. Request channels if cache time expired or does not exist
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getChannels = async (req, res) => {
	let cachedChannels = cache.read('channels')
	if (cachedChannels) {
		logger.debug("Getting Discord channels from cache")
		res.status(200).send(cachedChannels)
	} else {
		logger.debug("Getting Discord channels from API")
		axios.get(`https://discord.com/api/guilds/${process.env.BOT_GUILD_ID}/channels`, {
			headers: {
				"User-Agent": "DiscordBot (wagmi, 1.0)",
				"Authorization": `Bot ${process.env.BOT_TOKEN}`
			}
		}).then(response => {
			let remappedData = remapChannels(response.data)
			cache.write('channels', remappedData)
			res.status(200).send(remappedData)
		}).catch(err => {
			logger.error("Error on retrieving Discord channels: %O", err)
			res.status(500).send({ message: "Error on retrieving Discord channels" })
		})
	}
}

/**
 * Return cached Discord emojis of application guild and return them. Request emojis if cache time expired or does not exist
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getEmojis = async (req, res) => {
	let cachedEmojis = cache.read('emojis')
	if (cachedEmojis) {
		logger.debug("Getting Discord emojis from cache")
		res.status(200).send(cachedEmojis)
	} else {
		logger.debug("Getting Discord emojis from API")
		axios.get(`https://discord.com/api/guilds/${process.env.BOT_GUILD_ID}/emojis`, {
			headers: {
				"User-Agent": "DiscordBot (wagmi, 1.0)",
				"Authorization": `Bot ${process.env.BOT_TOKEN}`
			}
		}).then(response => {
			cache.write('emojis', response.data)
			res.status(200).send(response.data)
		}).catch(err => {
			logger.error("Error on retrieving Discord emojis: %O", err)
			res.status(500).send({ message: "Error on retrieving Discord emojis" })
		})
	}
}

/**
 * Return cached Discord roles of application guild and return them. Request roles if cache time expired or does not exist
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getRoles = async (req, res) => {
	let cachedRoles = cache.read('roles')
	if (cachedRoles) {
		logger.debug("Getting Discord roles from cache")
		res.status(200).send(cachedRoles)
	} else {
		logger.debug("Getting Discord roles from API")
		axios.get(`https://discord.com/api/guilds/${process.env.BOT_GUILD_ID}/roles`, {
			headers: {
				"User-Agent": "DiscordBot (wagmi, 1.0)",
				"Authorization": `Bot ${process.env.BOT_TOKEN}`
			}
		}).then(response => {
			cache.write('roles', response.data)
			res.status(200).send(response.data)
		}).catch(err => {
			logger.error("Error on retrieving Discord roles: %O", err)
			res.status(500).send({ message: "Error on retrieving Discord roles" })
		})
	}
}

/**
 * Return cached Discord members of application guild and return them. Request members if cache time expired or does not exist
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.getMembers = async (req, res) => {
	let cachedMembers = cache.read('members', 3 * 24 * 60 * 60 * 1000)
	if (cachedMembers) {
		logger.debug("Getting Discord members from cache")
		res.status(200).send(cachedMembers)
	} else {
		logger.debug("Getting Discord members from API")
		let lastUserId = 0
		let users = {}
		try {
			let currentData = []
			do {
				const response = await axios.get(`https://discord.com/api/guilds/${process.env.BOT_GUILD_ID}/members`, {
					headers: {
						"User-Agent": "DiscordBot (wagmi, 1.0)",
						"Authorization": `Bot ${process.env.BOT_TOKEN}`
					},
					params: {
						limit: 1000,
						after: lastUserId
					}
				})

				currentData = response.data
				for (let user of currentData) {
					if (user.user.id > lastUserId) lastUserId = user.user.id
					users[user.user.id] = user.user.username
				}

				await checkRateLimit(response.headers)
			} while (currentData.length)

			cache.write('members', users)
			res.status(200).send(users)
		} catch (err) {
			logger.error("Error on retrieving Discord members: %O", err)
			res.status(500).send({ message: "Error on retrieving Discord members" })
		}
	}
}

/**
 * Discord OAuth Login
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.login = async (req, res) => {
	const accessCode = req.query.code

	if (!accessCode) {
		res.send("No access code")
	} else {
		const formData = new URLSearchParams()
		formData.append("client_id", process.env.API_DISCORD_CLIENT_ID)
		formData.append("client_secret", process.env.API_DISCORD_CLIENT_SECRET)
		formData.append("grant_type", "authorization_code")
		formData.append("redirect_uri", process.env.API_DISCORD_REDIRECT_URI)
		formData.append("scopes", "identify")
		formData.append("code", accessCode)

		axios.post("https://discord.com/api/oauth2/token", formData, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}).then(tokenResponse => {
			axios.get("https://discord.com/api/users/@me", {
				method: 'GET',
				headers: {
					authorization: `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}`
				}
			})
				.then(userResponse => {
					username = `${userResponse.data.username}#${userResponse.data.discriminator}`

					req.session.data = req.session.data || {}
					req.session.data.discord_id = userResponse.data.id
					req.session.data.discord_username = username
					req.session.data.discord_avatar_id = userResponse.data.avatar

					res.redirect(process.env.API_FRONTEND_URL)
				}).catch(err => {
					logger.error("Error on retrieving user information: %O", err)
				})
		}).catch(err => {
			logger.error("Error on authenticating user: %O", err)
		})
	}
}

/**
 * Clears session data
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.logout = async (req, res) => {
	req.session.data = {}
	res.redirect(process.env.API_FRONTEND_URL)
}

/**
 * Flushs cached Discord data
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.clear = async (req, res) => {
	cache.clear()
	logger.info("Discord Cache cleared")
	res.status(200).send({ message: 'Discord Cache cleared! Reload the page!' })
}

/**
 * Returns current session data
 * 
 * @param {*} req - Request
 * @param {*} res - Response
 */
exports.data = async (req, res) => {
	res.status(200).send(req.session.data || {})
}