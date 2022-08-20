const fs = require("fs")

const cacheDirectory = process.cwd() + '/cache/'

exports.read = (file, cachingTime = 30 * 60 * 1000) => {
	let filePath = cacheDirectory + file + '.json'
	if (fs.existsSync(filePath) && (fs.statSync(filePath).mtimeMs + cachingTime > Date.now())) {
		return JSON.parse(fs.readFileSync(filePath))
	}

	return null
}

exports.write = (file, data) => {
	let filePath = cacheDirectory + file + '.json'
	fs.writeFileSync(filePath, JSON.stringify(data))
}

exports.clear = () => {
	const files = fs.readdirSync(cacheDirectory)
	for (const file of files) {
		if (file.indexOf('.json') > 0) {
			fs.unlinkSync(cacheDirectory + file)
		}
	}
}