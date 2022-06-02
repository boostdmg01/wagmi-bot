const crypto = require('crypto')

exports.encrypt = (text, encryptionKey) => {
	console.log(text, encryptionKey)
	try {
		let iv = crypto.randomBytes(16)
		let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv)
		let encrypted = cipher.update(text)

		encrypted = Buffer.concat([encrypted, cipher.final()])

		return iv.toString('hex') + ':' + encrypted.toString('hex')
	} catch(error) {
		throw new Error("Invalid encryption key")
	}
}

exports.decrypt = (text, encryptionKey) => {
	try {
		let textParts = text.split(':')
		let iv = Buffer.from(textParts.shift(), 'hex')
		let encryptedText = Buffer.from(textParts.join(':'), 'hex')
		let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv)
		let decrypted = decipher.update(encryptedText)

		decrypted = Buffer.concat([decrypted, decipher.final()])

		return decrypted.toString()
	} catch(error) {
		throw new Error("Invalid encryption key")
	}
}