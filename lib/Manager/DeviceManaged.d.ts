/// <reference types="socket.io" />
import { DeviceServerConfig } from '../Device/Device';
import { DeviceStatus } from '../Device/Status';
import { DeviceConnectedInfo } from './Interfaces';
import { TargetConfig } from './Manager';
export default class DeviceManaged {
    private name;
    private type;
    private socket;
    private proxies;
    private patch;
    constructor(info: DeviceConnectedInfo);
    getName(): string;
    getType(): string;
    getSocket(): import("socket.io").Socket;
    matchesTarget(target: TargetConfig): boolean;
    sendAction(action: string, payload: any): void;
    onStatus(fn: (status: DeviceStatus) => void): void;
    offStatus(fn: (status: DeviceStatus) => void): void;
    connected(): boolean;
    destroy(): void;
    addProxy(servers: DeviceServerConfig[]): void;
    private initProxyMiddleware;
    private emitStatusToProxies;
    private disconnectProxies;
}
