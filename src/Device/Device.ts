import * as getmac from 'getmac';
import io from 'socket.io-client';
import { DeviceStatus } from './Status';
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
  public sockets: SocketIOClient.Socket[] = [];
  private macAddress!: string;
  private config: DeviceConfig;
  private statusInterval?: NodeJS.Timeout;
  private actions: Map<string, () => void> = new Map();

  constructor(config: DeviceConfig) {
    this.config = config;
  }

  public async init() {
    this.macAddress = await this.getMac();
    this.sockets = await Promise.all(
      this.config.servers.map(serverConfig => {
        return new Promise<SocketIOClient.Socket>((resolve, reject) => {
          const socket = io.connect(
            `http://${serverConfig.host}:${serverConfig.port}`
          );
          socket.once('connect', () => {
            resolve(socket);
          });
          socket.once('connect_error', (err: string) => {
            reject(new Error(err));
          });
          socket.once('connect_timeout', (err: string) => {
            reject(new Error(err));
          });
        });
      })
    );
    this.initActions();
  }

  public destroy() {
    this.sockets.forEach(socket => {
      if (socket.connected) {
        socket.disconnect();
      }
    });
    this.sockets = [];
  }

  public autoStatusOn(statusCallback: () => object, interval: number) {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    this.statusInterval = setInterval(
      () => this.sendStatus(statusCallback()),
      interval
    );
  }

  public autoStatusOff() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = undefined;
    }
  }

  public sendStatus(payload: object) {
    this.sockets.forEach(socket => {
      if (socket.connected) {
        socket.emit('status', this.getStatusWithPayload(payload));
      }
    });
  }

  public onAction(action: string, fn: () => void) {
    this.actions.set(action, fn);
    this.sockets.forEach(socket => {
      socket.off(action);
      socket.on(action, fn);
    });
  }

  public offAction(action: string) {
    this.actions.delete(action);
    this.sockets.forEach(socket => {
      socket.off(action);
    });
  }

  public async getMac() {
    return new Promise<string>((resolve, reject) => {
      getmac.getMac((error, mac) => {
        if (error) {
          reject(error);
        }
        resolve(mac);
      });
    });
  }

  private getStatusWithPayload(payload: object) {
    const status: DeviceStatus = {
      device: {
        name: this.macAddress,
        type: this.config.type,
      },
      payload,
    };
    return status;
  }

  private initActions() {
    this.sockets.forEach(socket => {
      this.actions.forEach((fn, action) => {
        socket.on(action, fn);
      });
    });
  }
}
