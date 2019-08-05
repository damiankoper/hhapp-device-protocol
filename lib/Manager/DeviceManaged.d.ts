/// <reference types="socket.io" />
import { DeviceStatus } from '../Device/Status';
import { DeviceConnectedInfo } from './Interfaces';
import { TargetConfig } from './Manager';
export default class DeviceManaged {
    private name;
    private type;
    private socket;
    constructor(info: DeviceConnectedInfo);
    getName(): string;
    getType(): string;
    getSocket(): import("socket.io").Socket;
    getTargetConfig(): TargetConfig;
    matchesTarget(target: TargetConfig): boolean;
    sendAction(action: string, payload: any): void;
    onStatus(fn: (status: DeviceStatus) => void): void;
    offStatus(fn: (status: DeviceStatus) => void): void;
    connected(): boolean;
    destroy(): void;
}
