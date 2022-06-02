const twofactor = require("node-2fa");

const newSecret = twofactor.generateSecret({ name: "WAG Media Bot", account: "Payout 2FA" });
console.log(newSecret)