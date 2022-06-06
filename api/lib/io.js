const { io } = require("socket.io-client")
const logger = require("./logger")

let instance

module.exports = server => {
	const client = io(server)
	client.on("connect", () => logger.info(`Connected to ${server}`))
	client.on("disconnect", () => logger.info(`Disconnected from ${server}`))
	client.on("error", (error) => logger.error(`Socket Error: %O`, error))
	client.on("reconnect", () => logger.info(`Reconnected to ${server}`))

	instance = client

	return instance
}

module.exports.getIO = function () {
	if (!instance) {
		throw new Error("IO Instance must be initialized")
	}

	return instance
}