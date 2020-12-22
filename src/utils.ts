
import { URL } from 'url';
import { ServerInfo } from './types';

import { version as osVersion, arch, cpus, totalmem } from 'os';


export const parseServerInfo = (apiUrl: string): ServerInfo => {
  const url = new URL(apiUrl);
  return {
    address: url.host,
    secure: url.protocol === 'wss'
  }; 
};

export const getSystemInfo = () => ({
  nodeVersion: process.version,
  arch: arch(),
  osVersion: osVersion(),
  totalmem: totalmem(),
  cpuCount: cpus().length,
});
