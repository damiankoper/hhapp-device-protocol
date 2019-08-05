import SocketIO from 'socket.io';

import { DeviceServerConfig } from '../Device/Device';
import { DeviceStatus } from '../Device/Status';
import DeviceManaged from './DeviceManaged';
import DeviceControllerManaged from './DeviceControllerManaged';

type MacAddress = string;
type DeviceType = string;
type ActionType = string;

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

export class Manager {
  private config: ManagerConfig;
  private socket: SocketIO.Server;
  private devices: DeviceManaged[] = [];
  private controllers: DeviceControllerManaged[] = [];

  private statusHandlers: Map<
    (status: DeviceStatus) => void,
    TargetConfig
  > = new Map();
  private onConnectionHandler?: (device: DeviceManaged) => void;

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

  public getControllers() {
    return this.controllers
  }

  public onConnection(fn: (device: DeviceManaged) => void) {
    this.onConnectionHandler = fn;
  }

  public onStatus(target: TargetConfig, fn: (status: DeviceStatus) => void) {
    this.findTargets(target).forEach(device => {
      device.onStatus(fn);
    });
    this.statusHandlers.set(fn, target);
  }

  public offStatus(target: TargetConfig, fn: (status: DeviceStatus) => void) {
    this.findTargets(target).forEach(device => {
      device.offStatus(fn);
    });
    this.statusHandlers.delete(fn);
  }

  public sendAction(actionConfig: ActionConfig, payload: object) {
    const target = this.findTargets(actionConfig);
    if (target.length === 0) {
      throw new Error('Action ' + actionConfig.action + ' target not found!');
    }
    target.forEach((d: DeviceManaged) => {
      d.sendAction(actionConfig.action, payload);
    });
  }

  private findTargets(targetConfig: TargetConfig): DeviceManaged[] {
    return this.devices.filter(d => d.matchesTarget(targetConfig));
  }

  private findTargetControllers(targetConfig: TargetConfig): DeviceControllerManaged[] {
    return this.controllers.filter(d => d.matchesTarget(targetConfig));
  }

  private initConnectedDevice(socket: SocketIO.Socket) {
    if (socket.handshake.query.controller) {
      this.setController(socket)
    } else {
      this.setDevice(socket)
    }
  }

  private destroyDisconnectedDevice(socket: SocketIO.Socket) {
    const found = this.devices.findIndex(d => d.getSocket() === socket);
    this.devices.splice(found, 1);
  }

  private setDevice(socket: SocketIO.Socket) {
    const device = new DeviceManaged({
      ...(socket.handshake.query),
      socket,
    });
    this.devices.push(device);
    this.setStatusHandlers(device);
    socket.on('disconnect', () => this.destroyDisconnectedDevice(socket));

    if (this.onConnectionHandler) {
      this.onConnectionHandler(device);
    }
  }

  private setController(socket: SocketIO.Socket) {
    this.controllers.push(new DeviceControllerManaged({
      ...(socket.handshake.query),
      socket,
    }, this.devices))
  }

  private setStatusHandlers(device: DeviceManaged) {
    this.statusHandlers.forEach((target, fn) => {
      if (device.matchesTarget(target)) {
        device.onStatus(fn);
      }
    });

    device.onStatus((status => {
      this.findTargetControllers(device.getTargetConfig())
        .forEach(controller => {
          controller.sendStatus(status)
        })
    }));
  }
}
