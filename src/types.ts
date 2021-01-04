import { APISocket } from 'airdcpp-apisocket';


export interface SessionInfo {

}

export interface ServerInfo {
  address: string;
  secure: boolean;
}

export type StartHandler = (sessionInfo: SessionInfo) => void | Promise<void>;
export type StopHandler = () => any;

export interface ExtensionEntryData {	
  name: string;
  configPath: string;
  logPath: string;
  debugMode: boolean;
  server: ServerInfo;
  onStart: StartHandler;
  onStop: StopHandler;
}

export interface ExtensionOptions {
  minSleepDetectTimeout: number;
  aliveCheckInterval: number;
}

export type ScriptEntryHandler = (socket: APISocket, extension: ExtensionEntryData) => void;

export type ScriptEntryType = (ScriptEntryHandler & { default?: undefined }) | { default: ScriptEntryHandler };