import { APISocket } from 'airdcpp-apisocket';


export interface SessionInfo {

}

export interface AddressInfo {
	url: string;
	secure: boolean;
}

/*export interface ApiInfo extends AddressInfo {
	token: string;
}*/

export type StartHandler = (sessionInfo: SessionInfo) => void | Promise<void>;
export type StopHandler = () => any;

export interface ExtensionEntryData {	
  name: string;
	configPath: string;
	logPath: string;
	debugMode: boolean;
	api: AddressInfo;
	onStart: StartHandler;
	onStop: StopHandler;
}

export type ScriptEntryHandler = (socket: APISocket, extension: ExtensionEntryData) => void;

export type ScriptEntryType = (ScriptEntryHandler & { default?: undefined }) | { default: ScriptEntryHandler };