import { APISocket } from 'airdcpp-apisocket';
import { APIType } from '../api';
import { ContextType } from '../context';
import { ExtensionOptions } from '../types';



export const MockLogger = {
  verbose: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

const MockArgs = {
  name: 'mock-ext',
  configPath: 'mock-config-path',
  logPath: 'mock-log-path',
  settingsPath: 'mock-settings-path',
  authToken: 'mock-auth-token',
  apiUrl: 'mock-api-url',
  debug: false,
  appPid: 123,
};

const MockAPI: APIType = {
  ready: () => {
    return Promise.resolve();
  },
  getSettingValues: (values) => {
    return Promise.resolve([ 30 ] as any);
  },
  activity: () => {
    return Promise.resolve();
  },
};

const MockExtensionOptions: ExtensionOptions = {
  minSleepDetectTimeout: 30000,
  aliveCheckInterval: 5000
};

interface MockContextOptions {
  options?: ExtensionOptions;
  api?: Partial<APIType>;
  now?: () => number;
}

export const getMockContext = (overrides: MockContextOptions) => {
  const MockSocket = {
    reconnect: () => {
      return Promise.resolve({});
    },
    logger: MockLogger,
  } as Pick<APISocket, 'logger' | 'reconnect'>;
  
  const Context: ContextType = {
    argv: MockArgs,
    socket: MockSocket as APISocket,
    connectUrl: 'ws://mock-api-url:5600',
    api: {
      ...MockAPI,
      ...overrides.api,
    },
    options: {
      ...MockExtensionOptions,
      ...overrides.options,
    },
  };

  return Context;
};
