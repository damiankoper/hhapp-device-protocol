/// <reference types="socket.io-client" />
export { DeviceStatus } from './Status';
export interface DeviceServerConfig {
    host: string;
    port: number;
}
export interface DeviceConfig {
    type: string;
    servers: DeviceServerConfig[];
}
export default class Device {
    sockets: SocketIOClient.Socket[];
    private macAddress;
    private config;
    private statusInterval?;
    private actions;
    private statusCallback?;
    constructor(config: DeviceConfig);
    init(): Promise<void>;
    destroy(): void;
    setStatusGetter(statusCallback: () => object): void;
    autoStatusOn(interval: number): void;
    autoStatusOff(): void;
    sendStatus(payload: object): void;
    onAction(action: string, fn: (payload: object) => void): void;
    offAction(action: string): void;
    getMac(): Promise<string>;
    private getDeviceInfo;
    private getStatusWithPayload;
    private initActions;
}
