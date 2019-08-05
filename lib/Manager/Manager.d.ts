import { DeviceServerConfig } from '../Device/Device';
import { DeviceStatus } from '../Device/Status';
import DeviceControllerManaged from './DeviceControllerManaged';
import DeviceManaged from './DeviceManaged';
declare type MacAddress = string;
declare type DeviceType = string;
declare type ActionType = string;
export interface ManagerConfig {
    port: number;
}
export interface TargetConfig {
    name?: MacAddress;
    type?: DeviceType;
}
export interface ActionConfig extends TargetConfig {
    action: ActionType;
}
export interface DeviceProxyConfig extends TargetConfig {
    servers: DeviceServerConfig[];
}
export declare class Manager {
    private config;
    private socket;
    private devices;
    private controllers;
    private statusHandlers;
    private onConnectionHandler?;
    constructor(config: ManagerConfig);
    destroy(): void;
    getDevices(): DeviceManaged[];
    getControllers(): DeviceControllerManaged[];
    onConnection(fn: (device: DeviceManaged) => void): void;
    onStatus(target: TargetConfig, fn: (status: DeviceStatus) => void): void;
    offStatus(target: TargetConfig, fn: (status: DeviceStatus) => void): void;
    sendAction(actionConfig: ActionConfig, payload: object): void;
    private findTargets;
    private findTargetControllers;
    private initConnectedDevice;
    private destroyDisconnectedDevice;
    private setDevice;
    private setController;
    private setStatusHandlers;
}
export {};
