const axios = require("axios")
const cache = require("../lib/cache")
require("dotenv").config()

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

exports.getChannels = async (req, res) => {
	let cachedChannels = cache.read('channels')
	if (cachedChannels) {
		res.status(200).send(cachedChannels)
	} else {
		axios.get(`https://discord.com/api/guilds/${process.env.BOT_GUILD_ID}/channels`, {
			headers: {
				"User-Agent": "DiscordBot (wagmi, 1.0)",
				"Authorization": `Bot ${process.env.BOT_TOKEN}`
			}
		}).then(response => {

			let remappedData = remapChannels(response.data)

			cache.write('channels', remappedData)
			res.status(200).send(remappedData)
		}).catch(error => {
			res.status(500).send({ status: 500, error: error })
		})
	}
}

exports.getEmojis = async (req, res) => {
	let cachedEmojis = cache.read('emojis')
	if (cachedEmojis) {
		res.status(200).send(cachedEmojis)
	} else {
		axios.get(`https://discord.com/api/guilds/${process.env.BOT_GUILD_ID}/emojis`, {
			headers: {
				"User-Agent": "DiscordBot (wagmi, 1.0)",
				"Authorization": `Bot ${process.env.BOT_TOKEN}`
			}
		}).then(response => {
			cache.write('emojis', response.data)
			res.status(200).send(response.data)
		}).catch(error => {
			res.status(500).send({ status: 500, error: error })
		})
	}
}

exports.getRoles = async (req, res) => {
	let cachedRoles = cache.read('roles')
	if (cachedRoles) {
		res.status(200).send(cachedRoles)
	} else {
		axios.get(`https://discord.com/api/guilds/${process.env.BOT_GUILD_ID}/roles`, {
			headers: {
				"User-Agent": "DiscordBot (wagmi, 1.0)",
				"Authorization": `Bot ${process.env.BOT_TOKEN}`
			}
		}).then(response => {
			cache.write('roles', response.data)
			res.status(200).send(response.data)
		}).catch(error => {
			res.status(500).send({ status: 500, error: error })
		})
	}
}

exports.getMembers = async (req, res) => {
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

	let cachedMembers = cache.read('members')
	if (cachedMembers) {
		res.status(200).send(cachedMembers)
	} else {
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

				await delay(1000)
			} while (currentData.length)

			cache.write('members', users)
			res.status(200).send(users)
		} catch (error) {
			res.status(500).send({ status: 500, error: error })
		}
	}
}

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
					}).catch(e => console.log(e.response))
			}).catch(e => console.log('error', e))
	}
}

exports.logout = async (req, res) => {
	req.session.data = {}
	res.redirect(process.env.API_FRONTEND_URL)
}

exports.clear = async (req, res) => {
	cache.clear()
	res.status(200).send({ message: 'Discord Cache cleared! Reload the page!' })
}

exports.data = async (req, res) => {
	res.status(200).send(req.session.data || {})
}