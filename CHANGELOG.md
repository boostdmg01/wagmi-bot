# CHANGELOG

## 1.0.4
### Breaking Changes
* Splitted public reportings page from admin dashboard, now living in a seperate container

## 1.0.3
### Breaking Changes
* Refactored environment variables for easier configuration and deployment

## 1.0.2
### Bugfixes
* API: Validation fixed
* Client: Fixed missing input fields for processing transaction modal
* API/Bot: Prevent EVM null addresses to be submitted

### Changes
* Client: NGINX logs are now mounted to client/logs

## 1.0.1
### Bugfixes
* API: Fixed Discord Emoji Endpoint

### Changes
* API: ENCRYPTION_KEY removed. Encryption Key needs to be provided when adding/updating treasuries
* API/Client: 2FA added for processing transactions
* API/Client: Validation added
* Client: Valuation Settings removed, TransactionHandler pulls existential deposit constants from the chain instead 
* API: TransactionHandler refactored