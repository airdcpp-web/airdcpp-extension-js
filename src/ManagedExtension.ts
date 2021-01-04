import { APISocketOptions } from 'airdcpp-apisocket';
import { getDefaultContext } from './context';
import { getProcessStateChecker, EXIT_CODE_RESTART } from './process-state-checker';

import { ScriptEntryType, StartHandler, StopHandler } from './types';
import { getSystemInfo, parseServerInfo } from './utils';


export const ManagedExtension = (
  ScriptEntry: ScriptEntryType, 
  userSocketOptions: Partial<APISocketOptions> = {},
  contextGetter = getDefaultContext
) => {
  const { argv, socket, connectUrl } = contextGetter(userSocketOptions);

  process.title = argv.name;

  let onStart: StartHandler | undefined;
  let onStop: StopHandler | undefined;

  // socket.logger.verbose(`Node version: ${process.version} ()`);

  socket.logger.verbose(
    'Starting the extension', 
    JSON.stringify(process.argv), 
    JSON.stringify(argv, null, 2),
    JSON.stringify(getSystemInfo(), null, 2),
  );

  const onStopExtension = () => {
    if (onStop) {
      onStop();
    }
  };

  const processStateChecker = getProcessStateChecker(argv.appPid, socket, onStopExtension);

  // Socket state handlers
  socket.onConnected = (sessionInfo) => {
    // Use timeout so that we won't throw if the code doesn't work
    setTimeout(() => {
      processStateChecker.start();
      
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
    onStopExtension();
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

  const onSigint = () => {
    socket.logger.info('Exit requested');
    process.exit();
  };

  // Closing
  process.on('exit', onStopExtension);

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
    server: parseServerInfo(connectUrl),
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
      onStopExtension();
      process.exit(1);
    });

  return {
    stop: () => {
      processStateChecker.stop();
    },
  };
}