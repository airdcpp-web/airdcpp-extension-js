import { Socket, APISocketOptions } from 'airdcpp-apisocket';
import minimist from 'minimist';
import { API } from './api';
import { ExtensionOptions } from './types';


export interface StartupArgs {
  name: string;
  configPath: string;
  logPath: string;
  debug: boolean;
  signalReady?: boolean;
  apiUrl: string;
  settingsPath: string;
  authToken: string;
  appPid: number | undefined;
}

const defaultSocketOptions: Partial<APISocketOptions> = {
  // API settings
  autoReconnect: false,
  
  ignoredRequestPaths: [
    'sessions/activity'
  ]
};

const defaultExtensionOptions: ExtensionOptions = {
  minSleepDetectTimeout: 30000,
  aliveCheckInterval: 5000,
};

export const getDefaultContext = (userSocketOptions: Partial<APISocketOptions>, userExtensionOptions: Partial<ExtensionOptions>) => {
  const argv = minimist(process.argv.slice(2)) as any as StartupArgs;

  const connectUrl = `ws://${argv.apiUrl}`;
  const socket = Socket(
    {
      logLevel: argv.debug ? 'verbose' : 'info',
      ...defaultSocketOptions,
      ...userSocketOptions,
      url: connectUrl, 
    },
    require('websocket').w3cwebsocket
  );

  const api = API(socket, argv);

  const DefaultContext = {
    argv,
    socket,
    connectUrl,
    api,
    options: {
      ...defaultExtensionOptions,
      ...userExtensionOptions,
    }
  };

  return DefaultContext;
};

export type ContextType = ReturnType<typeof getDefaultContext>;
