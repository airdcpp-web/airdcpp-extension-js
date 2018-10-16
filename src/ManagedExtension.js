const API = require('airdcpp-apisocket');

const defaultSocketOptions = {
	// API settings
	autoReconnect: false,
	
	ignoredRequestPaths: [
		'sessions/activity'
	]
};


const argv = require('minimist')(process.argv.slice(2));


module.exports = function(ScriptEntry, userSocketOptions = {}) {
	let onStart, onStop;

	const socket = API.Socket(
		{
			logLevel: argv.debug ? 'verbose' : 'info',
			...defaultSocketOptions,
			...userSocketOptions,
			url: `ws://${argv.apiUrl}`
		},
		require('websocket').w3cwebsocket
	);

	// Ping handler
	// If the application didn't perform a clean exit, the connection may stay alive indefinitely
	// (happens at least on Windows, TODO: see if it can be solved)
	// This will avoid leaving zombie extensions running that would also block the log file handles

	let lastPing = new Date().getTime() + 9999;

	const handlePing = () => {
		if (lastPing + 10000 < new Date().getTime()) {
			socket.logger.error('Socket timed out, exiting...');
			stopExtension();
			process.exit(124);
			return;
		}

		socket.post('sessions/activity')
			.then(_ => lastPing = new Date().getTime())
			.catch(_ => socket.logger.error('Ping failed'));
	};


	// Socket state handlers
	socket.onConnected = (sessionInfo) => {
		// Use timeout so that we won't throw if the code doesn't work
		setTimeout(_ => {
			setInterval(handlePing, 4000);
			
			if (onStart) {
				onStart(sessionInfo);
			}
		}, 10);
	};

	socket.onDisconnected = () => {
		stopExtension();
		socket.logger.info('Socket disconnected, exiting');
		process.exit(1);
	};

	const stopExtension = () => {
		if (onStop) {
			onStop();
		}
	};

	const onSigint = () => {
		socket.logger.info('Exit requested');
		process.exit();
	};

	// Closing
	process.on('exit', stopExtension);

	process.on('SIGINT', onSigint);
	process.on('SIGTERM', onSigint);


	// Run extension
	ScriptEntry(socket, {
		name: argv.name,
		configPath: argv.settingsPath,
		logPath: argv.logPath,
		debugMode: argv.debug,
		set onStart(handler) {
			onStart = handler;
		},
		set onStop(handler) {
			onStop = handler;
		},
	});

	socket.reconnect(argv.authToken, false)
		.catch(error => {
			socket.logger.error(`Failed to connect to server ${argv.apiUrl}, exiting...`);
			stopExtension();
			process.exit(1);
		});
}