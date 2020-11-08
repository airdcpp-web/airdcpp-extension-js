import { Socket, APISocketOptions } from 'airdcpp-apisocket';
import minimist from 'minimist';

import { ScriptEntryType, StartHandler, StopHandler } from './types';


export interface StartupArgs {
	name: string;
	configPath: string;
	logPath: string;
	debug: boolean;
	signalReady?: boolean;
	apiUrl: string;
	settingsPath: string;
	authToken: string;
}

const defaultSocketOptions: Partial<APISocketOptions> = {
	// API settings
	autoReconnect: false,
	
	ignoredRequestPaths: [
		'sessions/activity'
	]
};

const argv = minimist(process.argv.slice(2)) as any as StartupArgs;

const EXIT_CODE_RESTART = 124;


export const ManagedExtension = (
	ScriptEntry: ScriptEntryType, 
	userSocketOptions: Partial<APISocketOptions> = {}
) => {
	let onStart: StartHandler | undefined;
	let onStop: StopHandler | undefined;

	const socket = Socket(
		{
			logLevel: argv.debug ? 'verbose' : 'info',
			...defaultSocketOptions,
			...userSocketOptions,
			url: `ws://${argv.apiUrl}`
		},
		require('websocket').w3cwebsocket
	);

	socket.logger.verbose('Starting the extension', JSON.stringify(process.argv), JSON.stringify(argv, null, 2));

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
			.catch(e => socket.logger.error(`Ping failed: ${e.message}`));
	};


	// Socket state handlers
	socket.onConnected = (sessionInfo) => {
		// Use timeout so that we won't throw if the code doesn't work
		setTimeout(() => {
			setInterval(handlePing, 4000);
			
			if (onStart) {
				Promise.resolve(onStart(sessionInfo))
					.then(() => {
						if (argv.signalReady) {
							socket.post(`extensions/${argv.name}/ready`)
								.catch(e => socket.logger.error(`Failed to signal ready state: ${e.message}`));
						}
					});
			}
		}, 10);
	};

	socket.onDisconnected = (reason, _code, wasClean) => {
		stopExtension();
		if (wasClean) {
			socket.logger.info('Socket disconnected (clean), exiting');
			process.exit(1);
		} else {
			// Unclean disconnects shouldn't be common with local extension, but may happen if the server is under heavy load
			// https://github.com/airdcpp-web/airdcpp-webclient/issues/356
			socket.logger.info(`Socket disconnected (unclean, ${reason}), requesting restart`);
			process.exit(EXIT_CODE_RESTART);	
		}
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
	const EntryFunction = typeof ScriptEntry === 'function' ? ScriptEntry : ScriptEntry.default;
	if (!EntryFunction) {
		throw 'Extension entry is not a function ';
	}

	EntryFunction(socket, {
		name: argv.name,
		configPath: argv.settingsPath,
		logPath: argv.logPath,
		debugMode: argv.debug,
		set onStart(handler: StartHandler) {
			onStart = handler;
		},
		set onStop(handler: StopHandler) {
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