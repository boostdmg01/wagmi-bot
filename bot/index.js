const logger = require("./lib/logger")
const Discord = require("discord.js")
const path = require("path")
const fs = require("fs")

const http = require("http")
const server = http.createServer()
const { Server } = require("socket.io")
const io = new Server(server)

const API = require("./lib/api")

const client = new Discord.Client({
	partials: ["MESSAGE", "CHANNEL", "REACTION", "USER"],
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES"]
})

let guild = null

client.on('error', logger.error)
client.on('warn', logger.warn)
client.on('disconnect', () => { logger.info('Disconnected from discord.') })
client.on('reconnecting', () => { logger.info('Reconnecting to discord.') })

client.once("ready", async () => {
	guild = await client.guilds.fetch(process.env.BOT_GUILD_ID)
	logger.info(`Logged in as ${client.user.tag}!`)

	server.listen(8085, () => logger.info(`Websocket open on port 8085`))

	await API.loadConfiguration()

	io.on("connection", socket => {
		socket.on("update", async () => {
			await API.loadConfiguration()
		})

		socket.on("send", async payload => {
			client.users.fetch(payload.userId, false).then(user => {
				user.send(payload.message).catch(err => {
					logger.error("Error sending message to %s: %O", user.username, err)
				})
			})
		})

		socket.on("verification", async (callback) => {
			const embed = new Discord.MessageEmbed()

			const welcomeTitle = `Welcome to ${guild.name}!`

			embed.addField(welcomeTitle, config.verification_intro_text)

			try {
				const message = await client.channels.cache.get(config.verification_channel_id).send({ embeds: [embed] })
				message.react("✅")
				logger.info("Verification message has been reset!")
				callback({ status: 200 })
			} catch(err) {
				logger.error("Error on resetting verification message: %O", err)
				callback({ status: 422, err })
			}
		})
	})

	await client.user.setActivity("Verify in #front-desk")
})

/** Load "actions" and initialize them **/
const actionsPath = path.join(__dirname, 'actions');
const actionFiles = fs.readdirSync(actionsPath).filter(file => file.endsWith('.js'));

for (const file of actionFiles) {
	const filePath = path.join(actionsPath, file);
	const actionHandler = require(filePath);
	new actionHandler(client)
}

client.login(process.env.BOT_TOKEN)