import { APISocket } from 'airdcpp-apisocket';
import { APIType } from '../api';
import { ContextType } from '../context';



export const MockLogger = {
  verbose: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

const MockArgs = {
  name: 'mock-ext',
  configPath: '',
  logPath: '',
  settingsPath: '',
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

export const getMockContext = () => {
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
    api: MockAPI,
  };

  return Context;
};
