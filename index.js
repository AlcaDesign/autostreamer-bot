require('dotenv').config();

const { spawn } = require('child_process');
const tmi = require('tmi.js');

const {
	DEBUG_LOG,
	TWITCH_BOT_USER,
	TWITCH_BOT_TOKEN,
	TWITCH_BOT_CHANNEL,
	TWITCH_OWNER_ID,
	INGEST_REGION,
	STREAM_KEY
} = process.env;

const debugMode = DEBUG_LOG === 'true' || DEBUG_LOG === '1';

/** @type {import("child_process").ChildProcessWithoutNullStreams} */
let ffmpegProcess = null;

const startInstructs = 'Use !startstream to start the stream.';
const stopInstructs = 'Use !stopstream to stop the stream.';

const client = new tmi.Client({
	options: {
		debug: debugMode
	},
	identity: {
		username: TWITCH_BOT_USER,
		password: TWITCH_BOT_TOKEN
	},
	connection: {
		reconnect: true,
		secure: true
	},
	channels: [
		TWITCH_BOT_CHANNEL
	]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	const userID = tags['user-id'];
	if(
		self ||
		message[0] !== '!' ||
		userID !== TWITCH_OWNER_ID
	) {
		return;
	}
	const params = message.slice(1).split(' ');
	const command = params.shift().toLowerCase();
	const { username: name } = tags;
	let reply = '';
	if(command === 'startstream' || command === 'streamstart') {
		reply = `✅ @${name}, stream starting. ${stopInstructs}`;
		if(ffmpegProcess) {
			reply = `✅ @${name}, already streaming. ${stopInstructs}`;
		}
		else {
			try {
				startStream();
			} catch(err) {
				console.error(err);
				reply = `❗ @${name}, failed to start streaming.`;
			}
		}
	}
	else if(command === 'stopstream' || command === 'streamstop') {
		reply = `✅ @${name}, stream starting. ${stopInstructs}`;
		if(!ffmpegProcess) {
			reply = `❌ @${name}, not currently streaming. ${startInstructs}`;
		}
		else {
			try {
				stopStream();
				reply = `❌ @${name}, stream stopping. ${startInstructs}`;
			} catch(err) {
				console.error(err);
				reply = `❗ @${name}, failed to stop streaming.`;
			}
		}
	}
	if(reply) {
		client.say(channel, reply);
	}
});

function startStream() {
	if(ffmpegProcess) {
		debugMode && console.log('Already streaming');
		return;
	}
	debugMode && console.log('Starting stream');
	const region = INGEST_REGION || 'live-sfo';
	const size = '640x360';
	const pixelFormat = 'yuv420p';
	const pattern = 'smptebars';
	const frameRate = '5';
	const input = `${pattern}=size=${size}:rate=${frameRate}`;
	const x264Preset = 'ultrafast';
	const output = `rtmp://${region}.twitch.tv/app/${STREAM_KEY}`;
	const ffmpegArgs = [
		'-re',
		'-f', 'lavfi',
		'-i', input,
		'-f', 'flv',
		'-vcodec', 'libx264',
		'-pix_fmt', pixelFormat,
		'-preset', x264Preset,
		'-r', frameRate,
		'-g', '30',
		output
	];
	ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
	ffmpegProcess.on('error', console.error);
	if(debugMode) {
		ffmpegProcess.stderr.on('data', chunk => console.log(chunk.toString()));
		console.log('Started stream');
	}
}

function stopStream() {
	if(!ffmpegProcess) {
		debugMode && console.log('Not currently streaming');
		return;
	}
	debugMode && console.log('Killing the stream');
	ffmpegProcess.kill();
	ffmpegProcess = null;
	debugMode && console.log('Killed the stream');
}
