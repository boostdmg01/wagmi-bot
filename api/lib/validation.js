const polkadotUtil = require("@polkadot/util-crypto")
const crypto = require("./crypto")

const Validation = {
    isNotEmpty: function (str) {
        return str !== null && /\S+/.test(str)
    },
    isNumber: function(str) {
        return str !== null && /^-?\d+$/.test(str)
    },
    isSubstrateAddress: function(str) {
        try {
            polkadotUtil.decodeAddress(str)

            return true
        } catch (e) { }

        return false
    },
    isEVMAddress: function(str) {
        if (/^0x0+$/.test(str)) return false

        return polkadotUtil.isEthereumAddress(str)
    },
    isJSON: function(str) {
        try {
            JSON.parse(str)
            return true
        } catch(e) { }

        return false
    },
    isNumberOrDecimal: function(str) {
        return str !== null && /^-?\d+\.?\d*$/.test(str)
    },
    isWebsocket: function (str) {
        return str !== null && /^wss?:\/\/[^\s.]+(?:\.[a-z]+)*(?::\d+)?/.test(str)
    },
    isUrl: function(str) {
        return str !== null && /^https?:\/\/[^\s.]+(?:\.[a-z]+)*(?::\d+)?(?:\/\w+)*/.test(str)
    },
    isValidEncryptionKey(str) {
        try {
            crypto.encrypt("validation", str)
            return true
        } catch(err) {
            return false
        }
    }
}

module.exports = Validation