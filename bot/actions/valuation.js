const API = require("../lib/api")
const logger = require("../lib/logger")

class ValuationAction {
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
                logger.error("Valuation: Error on fetching reaction: %O", err)
                return
            }
        }

        if (user.bot) return

        this.valuate(messageReaction, user)
    }

    /**
     * Valuate message based on reacted emoji by a director
     * 
     * @param {Discord.MessageReaction} messageReaction - reaction data
     * @param {Discord.User} user - user data
     */
    async valuate(messageReaction, user) {
        const { config, treasuryValuations } = API.getConfiguration()

        /** Check if the emoji which has been reacted with is one of the treasury emojis **/
        if (messageReaction._emoji.id in treasuryValuations) {
            this.client.guilds.fetch(process.env.BOT_GUILD_ID).then(guild => {
                /** Fetch user and check if he has a Director role **/
                guild.members.fetch(user.id).then(reactor => {
                    if (reactor.roles.cache.has(config.director_role_id)) {

                        /** Check if treasury emoji has a value set and if the message that has been reacted to is an elevated one **/
                        if (treasuryValuations[messageReaction._emoji.id].value > 0) {
                            API.request("http://api:8081/api/elevation/findOne", {
                                newMessageId: messageReaction.message.id
                            }, "POST").then(async elevationResponse => {
                                const elevatedMessage = elevationResponse.data

                                /** Build channel breadcrumb for valuation report **/
                                let source = await this.buildSourceName(messageReaction.message.channelId)


                                /** Base data for valuation based on current message **/
                                let insertValuationData = {
                                    messageId: messageReaction.message.id,
                                    discordEmojiId: messageReaction._emoji.id,
                                    treasuryId: treasuryValuations[messageReaction._emoji.id].treasuryId,
                                    userId: messageReaction.message.author.id,
                                    username: messageReaction.message.author.username,
                                    timestamp: Math.floor(Date.now() / 1000),
                                    value: treasuryValuations[messageReaction._emoji.id].value,
                                    messageLink: messageReaction.message.url,
                                    coinName: treasuryValuations[messageReaction._emoji.id].coinName,
                                    treasuryType: treasuryValuations[messageReaction._emoji.id].treasuryType,
                                    source: source
                                }

                                /** If the current message is an elevated one, update data for the valuation based on the old message **/
                                if (elevatedMessage.newMessageId) {
                                    source = await this.buildSourceName(elevatedMessage.oldChannelId)

                                    insertValuationData.messageId = elevatedMessage.oldMessageId
                                    insertValuationData.userId = elevatedMessage.userId
                                    insertValuationData.username = elevatedMessage.username
                                    insertValuationData.messageLink = `https://discord.com/channels/${process.env.BOT_GUILD_ID}/${elevatedMessage.oldChannelId}/${elevatedMessage.oldMessageId}`
                                    insertValuationData.source = source
                                }

                                /** Calculate royalty percentage if enabled **/
                                if (treasuryValuations[messageReaction._emoji.id].royaltyEnabled && treasuryValuations[messageReaction._emoji.id].royaltyPercentage > 0) {
                                    insertValuationData.royaltyValue = (insertValuationData.value / 100) * treasuryValuations[messageReaction._emoji.id].royaltyPercentage
                                }

                                /** Check if valuation already exists, send a dm if already valuated and remove the reaction **/
                                API.request("http://api:8081/api/valuation/findOne", {
                                    messageId: insertValuationData.messageId,
                                    discordEmojiId: messageReaction._emoji.id,
                                    treasuryId: insertValuationData.treasuryId
                                }, "POST").then(async response => {
                                    const valuatedMessage = response.data

                                    if (!valuatedMessage.id) {
                                        API.request("http://api:8081/api/valuation/insert", insertValuationData, "POST").then(response => {
                                            if (response.data.message) {
                                                messageReaction.message.author.send(response.data.message).catch(err => {
                                                    logger.error("Valuation: Error sending message to user %s (ID: %s): %O", messageReaction.message.author.tag, messageReaction.message.author.id, err)
                                                })
                                            }

                                            logger.info(`Valuation: Message %s has been valuated with %f %s`, messageReaction.message.id, treasuryValuations[messageReaction._emoji.id].value, treasuryValuations[messageReaction._emoji.id].coinName)
                                        }).catch(err => {
                                            messageReaction.remove()
                                            logger.info("Valuation: Error on valuating messageReaction %O", messageReaction)
                                        })
                                    } else {
                                        messageReaction.remove()
                                        user.send('Message has already been valuated with this emoji!').catch(err => {
                                            logger.error("Verification: Error replying to user %s (ID: %s): %O", user.tag, user.id, err)
                                        })
                                    }
                                })
                            })
                        }
                    }
                })
            }).catch(err => {
                logger.error("Valuation: Error fetching guild: %O", err)
            })
        }
    }

    /**
     * Build channel breadcrumb
     * 
     * @param {number} channelId - source channel Id
     * @param {string} source - current source breadcrumb
     * @returns {string} - final channel breadcrumb
     */
    async buildSourceName(channelId, source = '') {
        try {
            let channel = await this.client.channels.fetch(channelId)

            if (channel) {
                source = channel.name.replaceAll('━', '') + (source !== '' ? ' ' : '') + source
                if (channel.parentId) {
                    source = this.buildSourceName(channel.parentId, source)
                }
            }
        } catch (err) {
            logger.info("Valuation: Error fetching channel: %O", err)
        }

        return source
    }
}

module.exports = ValuationAction