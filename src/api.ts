import { APISocket } from 'airdcpp-apisocket';
import { StartupArgs } from './context';


export const API = (socket: APISocket, argv: StartupArgs) => {
	const activity = () => {
		return socket.post('sessions/activity');
	};

	const ready = () => {
		return socket.post(`extensions/${argv.name}/ready`);
	}

	const getSettingValues = <ValueT>(keys: string[]) => {
		return socket.post<Record<string, ValueT>>('settings/get', {
			keys
		});
	};

  return {
    activity,
    getSettingValues,
    ready,
  };
};

export type APIType = ReturnType<typeof API>;
