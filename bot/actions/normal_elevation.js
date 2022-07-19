const Discord = require("discord.js")
const API = require("../lib/api")
const logger = require("../lib/logger")

class NormalElevationAction {
    constructor(client) {
        this.client = client
        this.register()
    }

    /**
     * Register event handlers
     */
    register() {
        this.client.on("messageReactionAdd", async (messageReaction, user) => this.handleReactionAdd(messageReaction, user))
    }

	/**
	 * Handle added reaction
	 * 
     * @param {Discord.MessageReaction} messageReaction - reaction data
     * @param {Discord.User} user - user data
	 */
    async handleReactionAdd(messageReaction, user) {
        if (messageReaction.partial) {
            try {
                await messageReaction.fetch()
            } catch (err) {
                logger.error("Director Elevation: Error on fetching reaction: %O", err)
                return
            }
        }

        if (user.bot) return

        this.elevate(messageReaction)
    }

	/**
	 * Elevate message to news/content elevation channel
	 * 
     * @param {Discord.MessageReaction} messageReaction - reaction data
     * @param {Discord.User} user - user data
	 */
    async elevate(messageReaction) {
        const { config, treasuryElevations } = API.getConfiguration()

        let elevate = false
        let elevationChannelId = config.news_elevation_channel_id
        let elevationTitle = "Top Story 🔥"

		/** Only elevate from news or content channels **/
        if (config.news_channel_ids.includes(messageReaction.message.channelId)) {
            elevate = true
        } else if (config.content_channel_ids.includes(messageReaction.message.channelId)) {
            elevate = true
            elevationChannelId = config.content_elevation_channel_id
            elevationTitle = "Top Content 🔥"
        }

        /** Check if message is eligible to be elevated **/
        if (!elevate || messageReaction._emoji.id != config.elevation_emoji_id) {
            return
        }

        messageReaction.message.react(config.elevation_emoji_id)

        if (messageReaction.count >= config.elevation_required_emojis) {
            /** Check if message has already been valuated, if already elevated do nothing **/
            API.request("http://api:8081/api/elevation/find", [
                {
                    oldMessageId: messageReaction.message.id,
                    newChannelId: elevationChannelId
                },
                {
                    oldMessageId: messageReaction.message.id,
                    newChannelId: '-1'
                }
            ], "POST").then(async response => {
                const elevatedMessages = response.data

                if (!elevatedMessages.length) {
                    const embed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setAuthor(`${messageReaction.message.author.username} in  #${messageReaction.message.channel.name}`)
                        .setURL(messageReaction.message.url)
                        .setTitle(elevationTitle)
                        .setDescription(messageReaction.message.content)
                        .setTimestamp()

                    let attachments = []
                    if (messageReaction.message.attachments.size > 0) {
                        messageReaction.message.attachments.each(a => {
                            attachments.push(a.proxyURL)
                        })
                    }

					/** Send embedded messages and attachments **/
                    let newMessage = await this.client.channels.cache.get(elevationChannelId).send({ embeds: [embed, ...messageReaction.message.embeds], })
                    if (attachments.length) {
                        await this.client.channels.cache.get(elevationChannelId).send({ files: attachments })
                    }

					/** Submit elevation to API **/
                    await API.request("http://api:8081/api/elevation/insert", {
                        oldChannelId: messageReaction.message.channelId,
                        oldMessageId: messageReaction.message.id,
                        newChannelId: elevationChannelId,
                        newMessageId: newMessage.id,
                        userId: messageReaction.message.author.id,
                        username: messageReaction.message.author.username
                    }, "POST").then(() => {
                        this.client.log(`Normal Elevation: Message elevated to <#${elevationChannelId}> with ${messageReaction.count} emojis
${messageReaction.message.url}`)
                        logger.info(`Normal Elevation: Message %s elevated to <#%s> with %d emojis`, messageReaction.message.id, elevationChannelId, messageReaction.count)
                    }).catch(err => {
                        logger.error("Normal Elevation: API Error on inserting elevation")
                    })
                }
            }).catch(err => {
                logger.error("Normal Elevation: Error elevating messageReaction: %O", messageReaction)
            })
        }
    }
}

module.exports = NormalElevationAction