# WAG Media Bot 2.0

## Preparation

### Discord

### Enable Developer Mode in Discord
Go to your User Settings » Advanced and enable Developer Mode.

### Server Creation

If you don't have a discord yet, create a new one and save the guildId as **DISCORD_GUILD_ID**. You can copy the guildId by right-clicking your server and clicking on "Copy ID".

### Application and Bot Creation

Go to [https://discord.com/developers](https://discord.com/developers/)/ and set up your develper account. After setting up your account click on "New Application". Give your application a name and save. Upload an app icon in "General Information" that will be used for the OAuth login.

Navigate to OAuth2 and save the Client ID as **API_DISCORD_CLIENT_ID** and Client Secret as **API_DISCORD_CLIENT_SECRET**. You will need to add a redirect now and save it as **API_DISCORD_REDIRECT_URI**. This is your desired URL with the following path: **/api/discord/login**
Example: http://localhost:8080/api/discord/login

Click on save changes when a prompt does show up.

Now navigate to the subpage "URL Generator". Checkmark the "identify" scope and select your redirect from the dropdown. Copy and save the generated url as **VUE_APP_DISCORD_OAUTH_LINK**.

Navigate to "Bot" and click on "Add a bot". You can now upload a profile picture and give the bot a username that will displayed in the server. Copy the token and save it as **BOT_TOKEN**. Set "Public Bot" to "No" and "Server Member Intents" to "Yes".

### Invite Bot to Server

In the Discord Developer Portal go to your created application and navigate to the OAuth2 » URL Generator. Check mark "bot" in Scopes and checkmark "Administrator" in Bot Permissions. Copy and navigate to the generated url. You will get a prompt to select the server which the bot should join and grant his permissions.

### Role Configuration

After setting up the permissions for your channels for the bot go to  Server Settings  »  Roles. For the Discord bot to be able to assign roles to members the Bot role needs to be above other assignable roles. Hover over the Bot role and you will see a handle show up on the left side to drag-and-drop the role above the assignable roles. 

## Install packages

Run:

```
$ cd api
$ npm install
$ cd ../client
$ npm install
$ cd ../bot
$ npm install
````

## Get 2FA Key
Run, save key and visit the url provided for the qrCode and add it to your authenticator app:
```
$ node api/2fa.js
```

## Application Configuration


Add your saved information from preparation in the .env file in the project root:

**API_KEY** - API Key needed for requests to be processed\
**API_AUTHORIZED_DISCORD_IDS** - Discord User Ids which are eligible for using the admin frontend (comma-seperated) \
**API_DISCORD_CLIENT_ID** - Discord Application Client ID\
**API_DISCORD_CLIENT_SECRET** - Discord Application Client Secret\
**API_DISCORD_REDIRECT_URI** - Redirect URL to Backend API for authentication (ex: http://localhost:8080/api/discord/login) \
**API_FRONTEND_URL** - Redirect after login (ex: http://localhost:8080/admin/valuated-messages) \
**API_SESSION_SECRET** - Secret key for server sessions\
**API_TWOFA_KEY** - Secret key provided from previous step
**BOT_TOKEN** - Your Discord bot token\
**BOT_GUILD_ID** - Your Discord guild id\
**BOT_PREFIX** - Prefix for the discord command \
**DATABASE_ROOT_PASSWORD** - MySQL Root Password to use \
**DATABASE_PASSWORD** - MySQL Password to use \
**DATABASE_USER** - MySQL Username to use \
**DATABASE_DBNAME** - MySQL Database name to use \
**VUE_APP_API_URL** -  Your URL suffixed with /api/ (ex: http://localhost/api/)\
**VUE_APP_API_REPORT_URL** -  Your Report URL suffixed with /api/ (ex: http://report/api/)\
**VUE_APP_WEBSOCKET_API_URL** - Your URL with trailing slash (ex: http://localhost/) \
**VUE_APP_DISCORD_OAUTH_LINK** - Generated Discord OAuth Link with identify scope\

## Build client and start docker containers
Build client:
```
$ cd client
$ npm run build --production
```

After preparing and configuring everything you start the docker instance in the root directory with:
```
$ docker compose up
```
You can now login through your provided url (ex: http://localhost:8080/admin)