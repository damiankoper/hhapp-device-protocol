import SocketIO from 'socket.io';
import { DeviceInfo, DeviceStatus } from '../Device/Status';

type MacAddress = string;
type DeviceType = string;
type ActionType = string;
interface DeviceConnectedInfo extends DeviceInfo {
  socket: SocketIO.Socket
}

export interface ManagerConfig {
  port: number;
}
export interface ActionConfig {
  action: ActionType,
  name?: MacAddress,
  type?: DeviceType
}

export default class Manager {
  private config: ManagerConfig;
  private socket: SocketIO.Server;
  private devices: Map<MacAddress, DeviceConnectedInfo> = new Map();
  private statusHandlers: Map<
    DeviceType,
    (status: DeviceStatus) => void
  > = new Map();
  private onConnectionHandler?: (deviceInfo: DeviceInfo) => void;

  constructor(config: ManagerConfig) {
    this.config = config;
    this.socket = SocketIO();
    this.socket.listen(this.config.port);
    this.socket.on('connection', socket => {
      this.initConnectedDevice(socket);
    });
  }

  public destroy() {
    this.socket.close();
  }

  public getDevices() {
    return this.devices;
  }

  public onConnection(fn: (deviceInfo: DeviceInfo) => void) {
    this.onConnectionHandler = fn;
  }

  public onStatus(type: DeviceType, fn: (status: DeviceStatus) => void) {
    this.statusHandlers.set(type, fn);
  }

  public sendAction(actionConfig: ActionConfig, payload: object) {
    this.findActionTargets(actionConfig).forEach((socket: SocketIO.Socket) => {
      socket.emit(actionConfig.action, payload)
    });
  }

  private findActionTargets(actionConfig: ActionConfig): SocketIO.Socket[] {
    let found: SocketIO.Socket[] = [];
    const devices = Array.from(this.devices.values())
    if (actionConfig.name) {
      const foundByName = devices.find(info => info.name === actionConfig.name)
      if (foundByName) {
        return [foundByName.socket]
      }
      throw new Error('Device ' + actionConfig.name + ' not found!')
    }
    else if (actionConfig.type) {
      found = devices.filter(info => info.type === actionConfig.type)
        .map(info => info.socket)
      return found;
    }
    return devices.map(device => device.socket)
  }

  private initConnectedDevice(socket: SocketIO.Socket) {
    this.devices.set(socket.handshake.query.name, {
      ...socket.handshake.query,
      socket
    });

    socket.on('disconnect', () => this.destroyDisconnectedDevice(socket));
    socket.on('status', (status) => this.handleIncomingStatus(status));

    if (this.onConnectionHandler) {
      this.onConnectionHandler(socket.handshake.query as DeviceInfo);
    }
  }

  private handleIncomingStatus(status: DeviceStatus) {
    const statusHandler = this.statusHandlers.get(status.device.type);
    if (!statusHandler) {
      throw new Error(
        'No status handler for type ' + status.device.type + ' specified!'
      );
    } else {
      statusHandler(status);
    }
  }

  private destroyDisconnectedDevice(socket: SocketIO.Socket) {
    this.devices.delete(socket.handshake.query.mac);
  }

}
