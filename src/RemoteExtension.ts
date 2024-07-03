import { SessionInfo, ScriptEntryType, StartHandler, StopHandler } from './types.js';
import { Socket, APISocketOptions } from 'airdcpp-apisocket';

import chalk from 'chalk';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { parseServerInfo } from './utils.js';


const parseDataDirectory = (dataPath: string, directoryName: string) => {
  const directoryPath = path.resolve(dataPath, directoryName) + path.sep;

  if (!fs.existsSync(directoryPath)){
    mkdirp.sync(directoryPath);
  }

  return directoryPath;
};

const logStatus = (msg: string) => {
  console.log(chalk.cyan.bold(`[EXT] ${msg}`));
};

const logError = (msg: string) => {
  console.log(chalk.red.bold(`[EXT] ${msg}`));
};

interface ExtensionInfo {
  packageInfo: {
    name: string;
  };
  dataPath: string;
  nameSuffix: string;
};

import websocket from 'websocket'

export const RemoteExtension = (
  Entry: ScriptEntryType, 
  socketOptions: APISocketOptions, 
  { packageInfo, dataPath, nameSuffix }: ExtensionInfo
) => {
  const getExtensionName = () => {
    return nameSuffix ? (packageInfo.name + nameSuffix) : packageInfo.name;
  };

  let onStart: StartHandler | undefined;
  let onStop: StopHandler | undefined;
  let running = false;

  const socket = Socket(socketOptions, websocket.w3cwebsocket as any as WebSocket);

  const onExtensionRegistered = (sessionInfo: SessionInfo) => {
    // Use timeout so that we won't throw if the code doesn't work
    setTimeout(() => {
      logStatus(`Extension ${getExtensionName()} registered, starting the entry...`);

      // Run the script
      if (onStart) {
        onStart(sessionInfo);
        running = true;
      }
    }, 10);
  };

  const parseExtension = () => {
    // Remove a some of the the properties to make the console log a bit cleaner (and to prevent the debug build from crashing)
    const ret = Object.keys(packageInfo).reduce((reduced, key) => {
      if (key !== 'devDependencies' && key !== 'dependencies' && key !== 'scripts') {
        reduced[key as keyof typeof packageInfo] = packageInfo[key as keyof typeof packageInfo];
      }

      return reduced;
    }, {} as typeof packageInfo);

    return {
      ...ret,
      name: getExtensionName(),
    };
  };

  const stopExtension = () => {
    if (running && onStop) {
      onStop();
    }

    running = false;
  };

  const onSigint = () => {
    logStatus('Exit requested');
    process.exit();
  };

  // Socket state handlers
  socket.onConnected = (sessionInfo) => {
    logStatus('Socket connected, registering extension...');

    socket.post('extensions', parseExtension())
      .then(
        _ => {
          onExtensionRegistered(sessionInfo);
        }, 
        (e: Error) => {
          logError(`Failed to register the extension: ${e.message}`);
        }
      );
  };

  socket.onDisconnected = () => {
    logStatus('Socket disconnected');
    stopExtension();
  };

  // Closing
  process.on('exit', stopExtension);

  // Ctrl+C
  process.on('SIGINT', onSigint);

  // Launch extension
  const EntryFunction = typeof Entry === 'function' ? Entry : Entry.default;
  if (!EntryFunction) {
    throw 'Extension entry is not a function ';
  }

  EntryFunction(socket, {
    name: getExtensionName(),
    configPath: parseDataDirectory(dataPath, 'settings'),
    logPath: parseDataDirectory(dataPath, 'logs'),
    debugMode: process.env.NODE_ENV !== 'production',
    server: parseServerInfo(socketOptions.url),
    set onStart(handler: StartHandler) {
      onStart = handler;
    },
    set onStop(handler: StopHandler) {
      onStop = handler;
    },
  });

  logStatus('Connecting socket...');
  socket.connect();
};