const axios = require("axios")
require("dotenv").config()

axios.defaults.headers.common = { 'Authorization': `Bearer ${process.env.API_KEY}` }

const API = function () {
	this.config = {}
	this.treasuryElevations = {}
	this.treasuryValuations = {}

	this.client = axios.create({
		baseURL: 'http://api:8081/api/',
	})

	this.request = async (endpoint, data = {}, method = 'GET') => {
		try {
			return await this.client({
				url: endpoint,
				method: method,
				data: data
			})
		} catch (error) {
			return this.onError(error)
		}
	}

	this.loadConfiguration = async () => {
		await this.request("config/all").then((response => {
			this.config = response.data
		}).bind(this))

		await this.request("treasury/all").then((response => {
			this.treasuryElevations = {}

			const treasuries = response.data
			for (let treasury of treasuries) {
				if (treasury.elevationActive) {
					this.treasuryElevations[treasury.elevationEmojiId] = {
						channelId: treasury.elevationChannelId,
						amount: treasury.elevationAmount
					}
				}
			}
		}).bind(this))

		await request("emoji/all").then((response => {
			this.treasuryValuations = {}

			const treasuries = response.data
			for (let treasury of treasuries) {
				this.treasuryValuations[treasury.emojiId] = {
					value: treasury.amount,
					treasuryName: treasury.name,
					treasuryId: treasury.treasuryId,
					coinName: treasury.coinName,
					treasuryType: treasury.type,
					royalityPercentage: treasury.royalityPercentage,
					royalityEnabled: treasury.royalityEnabled
				}
			}
		}).bind(this))

		return { config, treasuryElevations, treasuryValuations }
	}

	this.getConfiguration = () => {
		const config = this.config
		const treasuryElevations = this.treasuryElevations
		const treasuryValuations = this.treasuryValuations

		return { config, treasuryElevations, treasuryValuations }
	}

	this.onError = (error) => {
		console.error('Request Failed:', error.config)

		if (error.response) {
			console.error('Status:', error.response.status)
			console.error('Data:', error.response.data)
			console.error('Headers:', error.response.headers)
		} else {
			console.error('Error Message:', error.message)
		}

		return Promise.reject(error.response || error.message)
	}

	return this
}

module.exports = API()