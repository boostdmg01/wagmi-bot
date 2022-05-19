const { io } = require("socket.io-client")

let instance

module.exports = server => {
	const client = io(server)
	client.on("connect", () => console.log(`Connected to ${server}`))

	instance = client

	return instance
}

module.exports.getIO = function () {
	if (!instance) {
		throw new Error("IO Instance must be initialized")
	}

	return instance
}