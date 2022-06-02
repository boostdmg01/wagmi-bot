# CHANGELOG

## 1.0.1
### Bugfixes
* API: Fixed Discord Emoji Endpoint

### Changes
* API: ENCRYPTION_KEY removed. Encryption Key needs to be provided when adding/updating treasuries
* API/Client: 2FA added for processing transactions
* API/Client: Validation added
* Client: Valuation Settings removed, TransactionHandler pulls existential deposit constants from the chain instead 
* API: TransactionHandler refactored