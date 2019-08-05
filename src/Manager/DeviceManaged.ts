import { DeviceStatus } from '../Device/Status';
import { DeviceConnectedInfo } from './Interfaces';
import { TargetConfig } from './Manager';

export default class DeviceManaged {
  private name: string;
  private type: string;
  private socket: SocketIO.Socket;

  public constructor(info: DeviceConnectedInfo) {
    this.socket = info.socket;
    this.name = info.name;
    this.type = info.type;
  }

  public getName() {
    return this.name;
  }

  public getType() {
    return this.type;
  }

  public getSocket() {
    return this.socket;
  }

  public getTargetConfig(): TargetConfig {
    return {
      type: this.type,
      name: this.name
    }
  }

  public matchesTarget(target: TargetConfig) {
    return target.name === this.name || target.type === this.type;
  }

  public sendAction(action: string, payload: any) {
    this.socket.emit(action, payload);
  }

  public onStatus(fn: (status: DeviceStatus) => void) {
    this.socket.on('status', fn);
  }

  public offStatus(fn: (status: DeviceStatus) => void) {
    this.socket.removeListener('status', fn);
  }

  public connected(): boolean {
    return this.socket.connected;
  }

  public destroy() {
    this.socket.disconnect();
  }
}
