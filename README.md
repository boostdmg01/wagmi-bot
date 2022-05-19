# WAG Media Bot 2.0

## Preparation

### Discord

### Enable Developer Mode in Discord
Go to your User Settings » Advanced and enable Developer Mode.

### Server Creation

If you don't have a discord yet, create a new one and save the guildId as **DISCORD_GUILD_ID**. You can copy the guildId by right-clicking your server and clicking on "Copy ID".

### Application and Bot Creation

Go to [https://discord.com/developers](https://discord.com/developers/)/ and set up your develper account. After setting up your account click on "New Application". Give your application a name and save. Upload an app icon in "General Information" that will be used for the OAuth login.

Navigate to OAuth2 and save the Client ID as **DISCORD_CLIENT_ID** and Client Secret as **DISCORD_CLIENT_SECRET**. You will need to add a redirect now and save it as **DISCORD_REDIRECT_URI**. This is your desired URL with the following path: **/api/discord/login**
Example: http://localhost:8080/api/discord/login

Click on save changes when a prompt does show up.

Now navigate to the subpage "URL Generator". Checkmark the "identify" scope and select your redirect from the dropdown. Copy and save the generated url as **DISCORD_OAUTH_LINK**.

Navigate to "Bot" and click on "Add a bot". You can now upload a profile picture and give the bot a username that will displayed in the server. Copy the token and save it as **TOKEN**. Set "Public Bot" to "No" and "Server Member Intents" to "Yes".

### Invite Bot to Server

In the Discord Developer Portal go to your created application and navigate to the OAuth2 » URL Generator. Check mark "bot" in Scopes and checkmark "Administrator" in Bot Permissions. Copy and navigate to the generated url. You will get a prompt to select the server which the bot should join and grant his permissions.

### Role Configuration

After setting up the permissions for your channels for the bot go to  Server Settings  »  Roles. For the Discord bot to be able to assign roles to members the Bot role needs to be above other assignable roles. Hover over the Bot role and you will see a handle show up on the left side to drag-and-drop the role above the assignable roles. 

## Application Configuration

### client/src/config.json

Add your saved information from preparation in here:
**API_URL** -  Your URL suffixed with /api/
**WEBSOCKET_API_URL** - Your URL without trailing slash
**DISCORD_OAUTH_LINK** - Generated Discord OAuth Link with identify scope

### api/.env

Add your saved information from preparation in here:
**API_KEY** - API Key needed for requests to be processed
**AUTHORIZED_DISCORD_IDS** - Discord User Ids which are eligible for using the admin frontend (comma-seperated)
**DISCORD_CLIENT_ID** - Discord Application Client ID
**DISCORD_CLIENT_SECRET** - Discord Application Client Secret
**DISCORD_REDIRECT_URI** - Redirect URL to Backend API for authentication (ex: http://localhost:8080/api/discord/login)
**DISCORD_GUILD_ID** - Guild ID of your server
**DISCORD_BOT_TOKEN** - Your Discord bot token
**FRONTEND_URL** - Redirect after login (ex: http://localhost:8080/admin/valuated-messages)
**SESSION_SECRET** - Secret key for server sessions
**ENCRYPTION_KEY** - 32 chars long secret which private keys/mnemonic get encrypted with

### bot/.env

Add your saved information from preparation in here:
**TOKEN** - Your Discord bot token
**API_TOKEN** - same API Key provided in api/.env
**GUILD_ID** - Your Discord guild id
**PREFIX** - Prefix for the discord command 

### docker-compose.yaml
Change the mysql credentials to whatever you like. Do not change the ports!

## Installation

First build a production ready artefact of the client:

    cd client
    npm i
    npm run build --production


After preparing and configuring everything you start the docker instance in the root directory with:

    docker compose up

You can now login through your provided url (ex: http://localhost:8080/admin)