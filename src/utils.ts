
import { URL } from 'url';
import { ServerInfo } from './types';


export const parseServerInfo = (apiUrl: string): ServerInfo => {
	const url = new URL(apiUrl);
	return {
		address: url.host,
		secure: url.protocol === 'wss'
	}; 
};
