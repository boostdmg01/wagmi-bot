const axios = require("axios")
const logger = require("../lib/logger")

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
		} catch (err) {
			logger.error("API Error: Request failed: %O", err)
			return Promise.reject(err)
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
					royaltyPercentage: treasury.royaltyPercentage,
					royaltyEnabled: treasury.royaltyEnabled
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

	return this
}

module.exports = API()