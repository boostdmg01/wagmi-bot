const axios = require("axios")
const Discord = require("discord.js")
require("dotenv").config()

exports.checkDirectorElevation = async (client, treasuryElevations, messageReaction, isContent) => {
	if (messageReaction._emoji.id in treasuryElevations) {
		var elevationInfo = treasuryElevations[messageReaction._emoji.id]
		if (messageReaction.count >= elevationInfo.amount) {
			let emoji = await client.emojis.cache.get(messageReaction._emoji.id)

			await axios.post("http://api:8081/api/elevation/findOne", {
				oldMessageId: messageReaction.message.id,
				newChannelId: elevationInfo.channelId
			}).then(async response => {
				const elevatedMessage = response.data

				if (!elevatedMessage.newMessageId) {
					console.log(`Message ${messageReaction.message.id} elevated to <#${elevationInfo.channelId}> with ${messageReaction.count} emojis`)
					const embed = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setAuthor(`${messageReaction.message.author.username} in  #${messageReaction.message.channel.name}`)
						.setURL(`https://discord.com/channels/${process.env.BOT_GUILD_ID}/${messageReaction.message.channelId}/${messageReaction.message.id}`)
						.setTitle('Top ' + (isContent ? 'Content' : 'Story') + ' <:' + emoji.identifier + '>')
						.setDescription(messageReaction.message.content)
						.setTimestamp()

					let attachments = []
					if (messageReaction.message.attachments.size > 0) {
						messageReaction.message.attachments.each(a => {
							attachments.push(a.proxyURL)
						})
					}

					let newMessage = await client.channels.cache.get(elevationInfo.channelId).send({ embeds: [embed, ...messageReaction.message.embeds] })
					if (attachments.length) {
						await client.channels.cache.get(elevationInfo.channelId).send({ files: attachments })
					}

					await axios.post("http://api:8081/api/elevation/insert", {
						oldMessageId: messageReaction.message.id,
						oldChannelId: messageReaction.message.channelId,
						newChannelId: elevationInfo.channelId,
						newMessageId: newMessage.id,
					}).catch(error => console.log(error.response.data.message))
				}
			}).catch(error => console.log(error))
		}
	}
}