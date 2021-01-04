import { APISocket } from 'airdcpp-apisocket';
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
  };

  return Context;
};
