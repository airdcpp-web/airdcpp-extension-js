
import { URL } from 'url';
import { ServerInfo } from './types';

import os from 'os';


export const parseServerInfo = (apiUrl: string): ServerInfo => {
  const url = new URL(apiUrl);
  return {
    address: url.host,
    secure: url.protocol === 'wss'
  }; 
};

export const getSystemInfo = () => ({
  nodeVersion: process.version,
  arch: os.arch(),
  osVersion: !!os.version ? os.version() : 'N/A',
  totalmem: os.totalmem(),
  cpuCount: os.cpus().length,
});
