import { DeviceStatus } from '../Device/Status';
import { TargetConfig } from './Manager';
import DeviceManaged from './DeviceManaged';


export interface DeviceControllerManagedConfig {
  target: TargetConfig,
  socket: SocketIO.Socket
}

export default class DeviceControllerManaged {
  private target: TargetConfig
  private socket: SocketIO.Socket;
  private devices: DeviceManaged[]

  public constructor(config: DeviceControllerManagedConfig, devices: DeviceManaged[]) {
    this.socket = config.socket;
    this.target = config.target;
    this.devices = devices
    this.setEvents()
  }

  public getSocket() {
    return this.socket;
  }

  public matchesTarget(target: TargetConfig) {
    return target.name === this.target.name || target.type === this.target.type;
  }

  public sendStatus(status: DeviceStatus) {
    this.socket.emit('status', status)
  }

  public connected(): boolean {
    return this.socket.connected;
  }

  public destroy() {
    this.socket.disconnect();
  }

  private setEvents() {
    this.socket.use((packet: SocketIO.Packet, next) => {
      if (packet[0] !== 'status') {
        this.devices.forEach(device => {
          if (device.matchesTarget(this.target)) {
            device.sendAction(packet[0], packet[1])
          }
        })
      }
      next()
    })
  }
}
