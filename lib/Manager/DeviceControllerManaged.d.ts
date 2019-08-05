/// <reference types="socket.io" />
import { DeviceStatus } from '../Device/Status';
import DeviceManaged from './DeviceManaged';
import { TargetConfig } from './Manager';
export interface DeviceControllerManagedConfig extends TargetConfig {
    socket: SocketIO.Socket;
}
export default class DeviceControllerManaged {
    private target;
    private socket;
    private devices;
    constructor(config: DeviceControllerManagedConfig, devices: DeviceManaged[]);
    getSocket(): import("socket.io").Socket;
    matchesTarget(target: TargetConfig): boolean;
    sendStatus(status: DeviceStatus): void;
    connected(): boolean;
    destroy(): void;
    private setEvents;
}
