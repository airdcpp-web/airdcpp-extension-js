import { APISocket } from 'airdcpp-apisocket';


export interface SessionInfo {

}

export type StartHandler = (sessionInfo: SessionInfo) => void | Promise<void>;
export type StopHandler = () => any;

export interface ExtensionEntryData {	
  name: string;
	configPath: string;
	logPath: string;
	debugMode: boolean;
	onStart: StartHandler;
	onStop: StopHandler;
}

export type ScriptEntryHandler = (socket: APISocket, extension: ExtensionEntryData) => void;

export type ScriptEntryType = (ScriptEntryHandler & { default?: undefined }) | { default: ScriptEntryHandler };