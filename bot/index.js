require("dotenv").config()
const Discord = require("discord.js")
const axios = require("axios")

const http = require("http")
const server = http.createServer()
const { Server } = require("socket.io")
const io = new Server(server)

const API = require("./lib/api")
const { verification } = require("./commands/verification")
const { checkDirectorElevation } = require("./commands/director_elevation")

const botToken = process.env.TOKEN
const prefix = process.env.PREFIX
const guildId = process.env.GUILD_ID

const client = new Discord.Client({
	partials: ["MESSAGE", "CHANNEL", "REACTION", "USER"],
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES"]
})

let guild = null

client.on('error', console.error)
client.on('warn', console.warn)
client.on('disconnect', () => { console.warn('Disconnected from discord.') })
client.on('reconnecting', () => { console.warn('Reconnecting to discord.') })

client.once("ready", async () => {
	guild = await client.guilds.fetch(guildId)
	console.log(`Logged in as ${client.user.tag}!`)

	server.listen(process.env.WEBSOCKET_PORT_DISCORD, () => console.log(`Websocket open on port ${process.env.WEBSOCKET_PORT_DISCORD}`))

	await API.loadConfiguration()

	io.on("connection", socket => {
		socket.on("update", async () => {
			await API.loadConfiguration()
		})

		socket.on("send", async payload => {
			client.users.fetch(payload.userId, false).then(user => {
				user.send(payload.message).catch((e) => console.error(e))
			})
		})

		socket.on("verification", async () => {
			const embed = new Discord.MessageEmbed()

			const welcomeTitle = `Welcome to ${guild.name}!`

			embed.addField(welcomeTitle, config.verification_intro_text)

			await client.channels.cache.get(config.verification_channel_id).send({ embeds: [embed] }).then(message => {
				message.react("✅")
				console.log("Verification message has been reset!")
			})
		})
	})

	await client.user.setActivity("Verify in #front-desk")
})

client.on("messageCreate", async msg => {
	if (msg.author.bot) return

	if (msg.content.indexOf(prefix) !== -1) {
		if (msg.channel.type == "DM") {
			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('verify_evm')
						.setLabel('EVM Address')
						.setStyle('PRIMARY'),
					new Discord.MessageButton()
						.setCustomId('verify_substrate')
						.setLabel('Substrate Address')
						.setStyle('SECONDARY'),
					new Discord.MessageButton()
						.setCustomId('verify_twitter')
						.setLabel('Twitter')
						.setStyle('PRIMARY'),
				)

			await msg.reply({ content: 'Please select an on option which data you want to verify or update!', components: [row] })
		}
	}


	let { config } = API.getConfiguration()

	if (msg.type !== 'THREAD_CREATED') {
		if (config.news_channel_ids.includes(msg.channelId)) {
			console.log(`Message ${msg.id} elevated to #mega-news-stream`)
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setAuthor(`${msg.author.username} in  #${msg.channel.name}`)
				.setURL(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)
				.setTitle('Top Story 🔥')
				.setDescription(msg.content)
				.setTimestamp()

			let attachments = []
			if (msg.attachments.size > 0) {
				msg.attachments.each(a => {
					attachments.push(a.proxyURL)
				})
			}

			await client.channels.cache.get(config.instant_elevation_channel_id).send({ embeds: [embed, ...msg.embeds], })
			if (attachments.length) {
				await client.channels.cache.get(config.instant_elevation_channel_id).send({ files: attachments })
			}
		} else if (config.content_channel_ids.includes(msg.channelId)) {
			console.log(`Message ${msg.id} elevated to #mega-news-stream`)
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setAuthor(`${msg.author.username} in  #${msg.channel.name}`)
				.setURL(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)
				.setTitle('Top Content 🔥')
				.setDescription(msg.content)
				.setTimestamp()

			let attachments = []
			if (msg.attachments.size > 0) {
				msg.attachments.each(a => {
					attachments.push(a.proxyURL)
				})
			}

			await client.channels.cache.get(config.instant_elevation_channel_id).send({ embeds: [embed, ...msg.embeds] })
			if (attachments.length) {
				await client.channels.cache.get(config.instant_elevation_channel_id).send({ files: attachments })
			}
		}
	}
})

client.on("interactionCreate", interaction => {
	if (interaction.type == "MESSAGE_COMPONENT") {
		client.emit("clickButton", interaction)
	}
})

client.on("clickButton", async button => {
	if (button.customId === 'verify_evm' || button.customId === 'verify_substrate' || button.customId === 'verify_twitter') {
		await verification(client, guild, button)
	}
})

client.on("messageReactionAdd", async (messageReaction, user) => {
	if (messageReaction.partial) {
		try {
			await messageReaction.fetch()
		} catch (error) {
			console.error('Error on reaction fetching:', error)
			return
		}
	}

	if (user.bot) return

	let { config, treasuryElevations, treasuryValuations } = API.getConfiguration()

	if (messageReaction.message.channelId == config.verification_channel_id) {
		const embed = new Discord.MessageEmbed()
		const welcomeTitle = `Verification for ${guild.name}`
		embed.addField(welcomeTitle, config.verification_dm_text)
		user.send({ embeds: [embed] }).then(() => console.log(`Verification message sent to ${user.tag}`)).catch((e) => console.error(e))
	} else if (messageReaction.message.channelId == config.introduction_channel_id) {
		var new_role_id = false
		var new_role_name = ''
		switch (messageReaction.emoji.id) {
			case config.finder_emoji_id:
				new_role_id = config.finder_role_id
				new_role_name = 'Finder'
				break
			case config.lurker_emoji_id:
				new_role_id = config.lurker_role_id
				new_role_name = 'Lurker'
				break
			case config.creator_emoji_id:
				new_role_id = config.creator_role_id
				new_role_name = 'Creator'
				break
		}

		guild.members.fetch(user.id).then(reactor => {
			if (new_role_id == false || !reactor.roles.cache.has(config.director_role_id)) {
				return
			}

			guild.members.fetch(messageReaction.message.author.id)
				.then(member => {
					if (member.roles.cache.has(new_role_id)) {
						return
					}

					member.roles.set([new_role_id]).then(() => {
						console.log(
							`${new_role_name} Role has been granted to ${member.user.tag} successfully!`
						)
					}).catch(e => console.error(e))
				})
				.catch(error => {
					console.error(error)
				})
		})
	} else {
		if (messageReaction._emoji.id in treasuryValuations) {
			guild.members.fetch(user.id).then(reactor => {
				if (reactor.roles.cache.has(config.director_role_id) || reactor.id == 411934476466257920) {
					axios.post("http://api:8081/api/valuation/findOne", {
						messageId: messageReaction.message.id,
						discordEmojiId: messageReaction._emoji.id
					}).then(async response => {
						const valuatedMessage = response.data

						if (!valuatedMessage.oldMessageId) {
							if (treasuryValuations[messageReaction._emoji.id].value > 0) {
								console.log(`Message ${messageReaction.message.id} valued with ${treasuryValuations[messageReaction._emoji.id].value} ${treasuryValuations[messageReaction._emoji.id].treasuryName}`)

								await axios.post("http://api:8081/api/elevation/findOne", {
									newMessageId: messageReaction.message.id
								}).then(async elevationResponse => {
									const elevatedMessage = elevationResponse.data

									let source = await buildSourceName(messageReaction.message.channelId)

									let insertValuationData = {
										messageId: messageReaction.message.id,
										discordEmojiId: messageReaction._emoji.id,
										treasuryId: treasuryValuations[messageReaction._emoji.id].treasuryId,
										userId: messageReaction.message.author.id,
										username: messageReaction.message.author.username,
										timestamp: Math.floor(Date.now() / 1000),
										value: treasuryValuations[messageReaction._emoji.id].value,
										messageLink: `https://discord.com/channels/916926605056696341/${messageReaction.message.channelId}/${messageReaction.message.id}`,
										coinName: treasuryValuations[messageReaction._emoji.id].coinName,
										treasuryType: treasuryValuations[messageReaction._emoji.id].treasuryType,
										source: source
									}

									if (elevatedMessage.newMessageId) {
										try {
											let oldMessage = await client.channels.cache.get(elevatedMessage['oldChannelId']).messages.fetch(elevatedMessage['oldMessageId'])

											source = await buildSourceName(oldMessage.channelId)

											insertValuationData.messageId = oldMessage.id
											insertValuationData.userId = oldMessage.author.id
											insertValuationData.username = oldMessage.author.username
											insertValuationData.messageLink = `https://discord.com/channels/916926605056696341/${oldMessage.channelId}/${oldMessage.id}`
											insertValuationData.source = source
										} catch (e) {
										}
									}

									if (treasuryValuations[messageReaction._emoji.id].royalityEnabled && treasuryValuations[messageReaction._emoji.id].royalityPercentage > 0) {
										insertValuationData.royalityValue = (insertValuationData.value / 100) * treasuryValuations[messageReaction._emoji.id].royalityPercentage
									}

									await axios.post("http://api:8081/api/valuation/insert", insertValuationData).then(response => {
										if (response.data.message) {
											user.send(response.data.message)
										}
									}).catch(error => {
										messageReaction.remove()
										console.error(error)
									})
								})
							}
						} else {
							messageReaction.remove()
							user.send('Message is already been valuated with this emoji!')
						}
					}).catch(error => console.error(error))
				}
			})
		}
	}

	if (config.news_channel_ids.includes(messageReaction.message.channelId)) {
		messageReaction.message.react(config.elevation_emoji_id)
		if (messageReaction._emoji.id == config.elevation_emoji_id) {
			if (messageReaction.count >= config.elevation_required_emojis) {
				await axios.post("http://api:8081/api/elevation/find", [
					{
						oldMessageId: messageReaction.message.id,
						newChannelId: config.news_elevation_channel_id
					},
					{
						oldMessageId: messageReaction.message.id,
						newChannelId: '-1'
					}
				]).then(async response => {
					const elevatedMessages = response.data

					if (!elevatedMessages.length) {
						console.log(`Message ${messageReaction.message.id} elevated to top story with ${messageReaction.count} emojis`)
						const embed = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setAuthor(`${messageReaction.message.author.username} in  #${messageReaction.message.channel.name}`)
							.setURL(`https://discord.com/channels/${guildId}/${messageReaction.message.channelId}/${messageReaction.message.id}`)
							.setTitle('Top Story 🔥')
							.setDescription(messageReaction.message.content)
							.setTimestamp()

						let attachments = []
						if (messageReaction.message.attachments.size > 0) {
							messageReaction.message.attachments.each(a => {
								attachments.push(a.proxyURL)
							})
						}

						let newMessage = await client.channels.cache.get(config.news_elevation_channel_id).send({ embeds: [embed, ...messageReaction.message.embeds], })
						if (attachments.length) {
							await client.channels.cache.get(config.news_elevation_channel_id).send({ files: attachments })
						}

						await axios.post("http://api:8081/api/elevation/insert", {
							oldMessageId: messageReaction.message.id,
							newChannelId: config.news_elevation_channel_id,
							newMessageId: newMessage.id,
							oldChannelId: messageReaction.message.channelId
						}).catch(error => console.error(error.response.data.message))
					}
				}).catch(error => console.error(error))
			}
		} else {
			await checkDirectorElevation(client, treasuryElevations, messageReaction, false)
		}
	} else if (config.content_channel_ids.includes(messageReaction.message.channelId)) {
		messageReaction.message.react(config.elevation_emoji_id)
		if (messageReaction._emoji.id == config.elevation_emoji_id) {
			if (messageReaction.count >= config.elevation_required_emojis) {
				await axios.post("http://api:8081/api/elevation/find", [
					{
						oldMessageId: messageReaction.message.id,
						newChannelId: config.content_elevation_channel_id
					},
					{
						oldMessageId: messageReaction.message.id,
						newChannelId: '-1'
					}
				]).then(async response => {
					const elevatedMessages = response.data

					if (!elevatedMessages.length) {
						console.log(`Message ${messageReaction.message.id} elevated to top content with ${messageReaction.count} emojis`)
						const embed = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setAuthor(`${messageReaction.message.author.username} in  #${messageReaction.message.channel.name}`)
							.setURL(`https://discord.com/channels/${guildId}/${messageReaction.message.channelId}/${messageReaction.message.id}`)
							.setTitle('Top Content 🔥')
							.setDescription(messageReaction.message.content)
							.setTimestamp()

						let attachments = []
						if (messageReaction.message.attachments.size > 0) {
							messageReaction.message.attachments.each(a => {
								attachments.push(a.proxyURL)
							})
						}

						let newMessage = await client.channels.cache.get(config.content_elevation_channel_id).send({ embeds: [embed, ...messageReaction.message.embeds] })
						if (attachments.length) {
							await client.channels.cache.get(config.content_elevation_channel_id).send({ files: attachments })
						}

						await axios.post("http://api:8081/api/elevation/insert", {
							oldMessageId: messageReaction.message.id,
							newChannelId: config.content_elevation_channel_id,
							newMessageId: newMessage.id,
							oldChannelId: messageReaction.message.channelId
						}).catch(error => console.error(error.response.data.message))
					}
				}).catch(error => console.error(error))
			}
		} else {
			await checkDirectorElevation(client, treasuryElevations, messageReaction, true)
		}
	}
})

const buildSourceName = async (channelId, source = '') => {
	try {
		let channel = await client.channels.fetch(channelId)

		if (channel) {
			source = channel.name + (source !== '' ? ' // ' : '') + source
			if (channel.parentId) {
				source = buildSourceName(channel.parentId, source)
			}
		}
	} catch (e) {
	}

	return source
}

client.on("messageReactionRemove", async (messageReaction, user) => {
	if (user.bot) return

	if (messageReaction.partial) {
		try {
			await messageReaction.fetch()
		} catch (error) {
			console.error('Error on reaction fetching:', error)
			return
		}
	}

	let { config } = API.getConfiguration()

	if (messageReaction.message.channelId == config.verification_channel_id) {
		guild.members.fetch(user.id)
			.then(member => {
				member
					.roles.remove(config.newcomer_role_id)
					.then(() => {
						console.log(
							`New Comer Role has been removed from ${member.user.tag} successfully!`
						)
					})
					.catch(e => console.error(e))
			})
			.catch(error => {
				console.error(error)
			})
	}
})

client.on('guildMemberAdd', member => {
	let { config } = API.getConfiguration()

	member.roles.add(config.unverified_role_id)
})

client.login(botToken)