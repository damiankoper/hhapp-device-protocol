import { DeviceServerConfig } from './Device';
import { DeviceStatus } from './Status';
export { DeviceStatus } from './Status';
import { TargetConfig } from '../Manager/Manager';
export interface DeviceControllerConfig {
    target: TargetConfig;
    manager: DeviceServerConfig;
}
export declare class DeviceController {
    private socket?;
    private config;
    constructor(config: DeviceControllerConfig);
    init(): Promise<void>;
    getTargetConfig(): TargetConfig;
    destroy(): void;
    onStatus(fn: (status: DeviceStatus) => void): void;
    sendAction(action: string, payload: any): void;
}
