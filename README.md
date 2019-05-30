# Autostreamer-Bot

Using a simple chat bot for controls via commands in Twitch chat, stream an
ffmpeg test pattern to a Twitch channel.

Send an ffmpeg test pattern stream to a Twitch channel controlled by chat
commands.

## Install

Install Node.js and ffmpeg on the system and set up the `.env` file from the
`.env.example` file.

```bash
$ git clone git@github.com:alcadesign/autostreamer-bot.git
$ cd autostreamer-bot
$ npm install
```

### Environment variables

- **`INGEST_REGION`** - The region of the preferred ingest server. The default
	is "`live-sfo`". See the [Twitch Ingests][ingests] page for a list of
	possible regions.
- **`STREAM_KEY`** - A Twitch stream key to authenticate with.
- **`TWITCH_OWNER_ID`** - The user ID of the owner/controller account.
- **`TWITCH_BOT_USER`** - The username of the bot account.
- **`TWITCH_BOT_TOKEN`** - The token of the bot account. Needs the required
	scopes for sending messages to chat.
- **`TWITCH_BOT_CHANNEL`** - The name of the channel to listen to in chat.

## Running

The basic way to run it is just using Node:

```bash
$ node index.js
```

This bot could be set up using any daemon like `service`, `systemctl`, or Node-
based daemons like `pm2` or `forever`.

## Commands

| Command | Arguments | Description
| --- | --- | --- |
| `!startstream` | | Start streaming. |
| `!stopstream` | | Stop streaming. |

## Credits

Inspiration from ["park-stream"][park-stream] by [freaktechnik][freaktechnik].

# Todo

- Ensure required environment variables are available.
- Catch possible `tmi.js` errors from `client.say` or if the credentials don't
	pass logging in.
- Allow anonymous (and/or silent) chat integration.
- Better permission system.
- Ensure ffmpeg is installed.
- Ensure the stream _actually_ starts and stops.
- Investigate `child_process` errors.
- Expand upon README.
- Think of more Todo's.


[ingests]: https://stream.twitch.tv/ingests/
[park-stream]: https://github.com/freaktechnik/park-stream
[freaktechnik]: https://github.com/freaktechnik
