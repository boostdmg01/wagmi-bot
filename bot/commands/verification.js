const axios = require("axios")
const polkadotUtil = require("@polkadot/util-crypto")
const API = require("../lib/api")

exports.verification = async (client, guild, button) => {
	axios.get(`http://api:8081/api/user/${button.user.id}`).then(async apiUser => {
		let type = 'EVM address'
		let currentValue = apiUser.data.evmAddress
		if (button.customId === 'verify_substrate') {
			type = 'Substrate address'
			currentValue = apiUser.data.substrateAddress
		} else if (button.customId === 'verify_twitter') {
			type = 'Twitter handle'
			currentValue = apiUser.data.twitterHandle
		}

		let text = []
		if (currentValue === null) {
			text.push(`You didn't submit a ${type} yet.`)
			if (button.customId === 'verify_twitter') {
				text.push(`Please enter your Twitter handle without the @`)
			} else {
				text.push(`Please enter your ${type}`)
			}
		} else {
			text.push(`Your current ${type} is: ${currentValue}`)
			if (button.customId === 'verify_twitter') {
				text.push(`Please enter your new Twitter handle without the @`)
			} else {
				text.push(`Please enter your new ${type}`)
			}
		}

		await button.reply(text.join("\n"))

		button.message.channel.awaitMessages({ max: 1, time: 30000, errors: ['time'] })
			.then(async collected => {
				const msg = collected.first()
				if (msg.author.id === button.user.id) {
					let data = {
						id: button.user.id
					}

					let isValid = true

					if (button.customId === 'verify_substrate') {
						data.substrateAddress = msg.content
						try {
							polkadotUtil.decodeAddress(data.substrateAddress)
						} catch (e) {
							isValid = false
						}
					} else if (button.customId === 'verify_evm') {
						data.evmAddress = msg.content
						if (/^0x0+$/.test(data.evmAddress)) {
							isValid = false
						} else {
							isValid = polkadotUtil.isEthereumAddress(data.evmAddress)
						}
					} else if (button.customId === 'verify_twitter') {
						data.twitterHandle = msg.content
					}

					if (isValid) {
						axios.post('http://api:8081/api/user/insertOrUpdate', data).then(async response => {
							await msg.reply(`Your ${type} has been changed to: ${msg.content}`)

							let { config } = API.getConfiguration()

							guild.members.fetch(button.user.id)
								.then(member => {
									console.log('h')
									if (member.roles.cache.has(config.unverified_role_id)) {
										console.log('h2')
										member
											.roles.remove(config.unverified_role_id)
											.then(() => {
												client.logs.log(
													`Unverified Role has been removed from ${member.user.tag} successfully!`
												)
											})
											.catch(e => client.logs.error(e))

										member
											.roles.add(config.newcomer_role_id)
											.then(() => {
												member.send('You are verified now! Please introduce yourself in #new-here')
											})
											.catch(e => client.logs.error(e))
									}
								})
								.catch(error => {
									client.logs.error(error)
								})
						}).catch(error => {
							client.logs.log(error)
						})
					} else {
						await msg.reply(`Your entered ${type} is not valid.`)
					}
				}
			})
	}).catch(error => {
		console.log(error.response.data.message)
	})
}