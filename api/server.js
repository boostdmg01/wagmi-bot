require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const session = require("express-session")
const twofactor = require("node-2fa")

const authorizedUsers = process.env.API_AUTHORIZED_DISCORD_IDS.split(',')
const apiKey = process.env.API_KEY
const sessionSecret = process.env.API_SESSION_SECRET

const http = require("http")
const server = http.createServer()
const { Server } = require("socket.io")
const io = new Server(server, { path: '/' })

require("./lib/io")("ws://bot:8085/")

const txHandler = require("./lib/txhandler")

var unless = function (middleware, ...paths) {
	return function (req, res, next) {
		const pathCheck = paths.some(path => path === req.path)
		pathCheck ? next() : middleware(req, res, next)
	}
}

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: false,
	name: 'wagmi_bot',
	cookie: {
		expires: 3 * 60 * 60 * 1000,
	},
}))

app.use(unless((req, res, next) => {
	if (req.headers) {
		if (req.headers.authorization) {
			const parts = req.headers.authorization.split(' ')
			if (parts.length === 2 && parts[0] === 'Bearer') {
				if (parts[1] === apiKey) {
					next()
					return
				}
			}
		}

		if (req.session.data) {
			if (authorizedUsers.includes(req.session.data.discord_id)) {
				next()
				return
			}
		}
	}

	res.status(400).send()
}, "/api/discord/login", "/api/valuation/public", "/api/treasury/public"))

require("./routes.js")(app)

app.listen(8081, () => {
	console.log("Server is running on port 8081.")
})

server.listen(8086, () => console.log(`Websocket open on port 8086`))

io.on("connection", socket => {
	socket.on("process", (data) => {
		console.log('here', data)
		if (txHandler.isRunning) {
			socket.emit('error', 'Transactions are currently being processed')
		} else {
			let twoFATokenValid = twofactor.verifyToken(process.env.API_TWOFA_KEY, data.twoFAToken, 1);
			console.log(twoFATokenValid)
			if (twoFATokenValid !== null && twoFATokenValid.delta === 0) {
				txHandler.run(socket, data.encryptionKey)
			} else {
				socket.emit('error', '2FA Token invalid! Please retry!')
			}
		}
	})
})