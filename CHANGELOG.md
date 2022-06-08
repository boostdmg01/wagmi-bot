# CHANGELOG

## 1.0.6
## Changes
* API: Added further validation for encryption key and RPC url inputs
* API/Bot/Client: Added a verification DM success text field
* Client: mnemonics, private key and encryption key are now password fields with visibility toggle

## 1.0.5
## Bugfixes
* API: Fixed sending result of an inserted valuation

## Changes
* Global: Added ENVIRONMENT variable to .env (production|development) for logging purposes
* API/Bot: Log functionality added
* API/Bot: dotenv package removed since the enviroment variables get injected by docker-compose
* API/Bot: Started adding simple documentation to API/Bot
* API: Removed unused controller and model implementations
* API: TransactionHandler now waits for a status for each substrate transaction
* Bot: Refactored code and abstracting separate features into "actions" loaded by the bot
* Client/Report: Relabeled "Paid" status for transactions to "Transaction submitted"

## Breaking Changes
* API: Typo fix royalities/royality -> royalties/royalty in database schemas and application logic
* API: Renamed chainTypes to chainOptions and modified functionality to implement transaction options. Now represents an optional JSON object like this:
```
{
    types: {}, # Defined API types for the chain
    options: {} # Optional transaction options (ex. tip)
}
```

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