import { Socket, APISocketOptions } from 'airdcpp-apisocket';
import minimist from 'minimist';


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


export const getDefaultContext = (userSocketOptions: Partial<APISocketOptions> = {}) => {
  const argv = minimist(process.argv.slice(2)) as any as StartupArgs;
  const connectUrl = `ws://${argv.apiUrl}`;

  const DefaultContext = {
    argv,
    socket: Socket(
      {
        logLevel: argv.debug ? 'verbose' : 'info',
        ...defaultSocketOptions,
        ...userSocketOptions,
        url: connectUrl, 
      },
      require('websocket').w3cwebsocket
    ),
    connectUrl,
  };

  return DefaultContext;
};

export type ContextType = ReturnType<typeof getDefaultContext>;