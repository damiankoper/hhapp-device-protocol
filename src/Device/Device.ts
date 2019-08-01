import * as getmac from 'getmac';
import io from 'socket.io-client';
import { DeviceInfo, DeviceStatus } from './Status';
export { DeviceStatus } from './Status';

export interface DeviceServerConfig {
  host: string;
  port: number;
}

type MacAddress = string;

export interface DeviceConfig {
  type: string;
  servers: DeviceServerConfig[];
}

export class Device {
  public sockets: SocketIOClient.Socket[] = [];
  private macAddress!: string;
  private config: DeviceConfig;
  private statusInterval?: NodeJS.Timeout;
  private actions: Map<MacAddress, (payload: object) => void> = new Map();
  private statusCallback?: () => object;

  constructor(config: DeviceConfig) {
    this.config = config;
  }

  public async init() {
    this.macAddress = await this.getMac();
    this.sockets = await Promise.all(
      this.config.servers.map(serverConfig => {
        return new Promise<SocketIOClient.Socket>((resolve, reject) => {
          const device = this.getStatusWithPayload({}).device;
          const socket = io.connect(
            `http://${serverConfig.host}:${serverConfig.port}`,
            {
              query: {
                ...device,
              },
            }
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

  public setStatusGetter(statusCallback: () => object) {
    this.statusCallback = statusCallback;
  }

  public autoStatusOn(interval: number) {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    this.statusInterval = setInterval(() => {
      if (this.statusCallback) {
        this.sendStatus(this.statusCallback());
      } else {
        throw new Error('Warning! Status getter not set!');
      }
    }, interval);
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

  public onAction(action: string, fn: (payload: object) => void) {
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
    return new Promise<MacAddress>((resolve, reject) => {
      getmac.getMac((error, mac) => {
        if (error) {
          reject(error);
        }
        resolve(mac);
      });
    });
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      name: this.macAddress,
      type: this.config.type,
    };
  }

  private getStatusWithPayload(payload: object) {
    const status: DeviceStatus = {
      device: this.getDeviceInfo(),
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
