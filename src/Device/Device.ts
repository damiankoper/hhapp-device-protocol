import * as getmac from 'getmac';
import io from 'socket.io-client';
import DeviceStatus from './Status';

export interface DeviceServerConfig {
  host: string;
  port: number;
}

export interface DeviceConfig {
  type: string;
  servers: DeviceServerConfig[];
}

export default class Device {
  macAddress!: string;
  config: DeviceConfig;
  private statusInterval?: NodeJS.Timeout;
  sockets: SocketIOClient.Socket[] = [];

  constructor(config: DeviceConfig) {
    this.config = config;
  }

  async init() {
    this.macAddress = await this.getMac();
    this.sockets = await Promise.all(
      this.config.servers.map(serverConfig => {
        return new Promise<SocketIOClient.Socket>((resolve, reject) => {
          let socket = io.connect(
            `http://${serverConfig.host}:${serverConfig.port}`
          );
          socket.once('connect', function() {
            resolve(socket);
          });
          socket.once('connect_error', function(err: string) {
            reject(new Error(err));
          });
          socket.once('connect_timeout', function() {
            reject(new Error('connect_timeout'));
          });
        });
      })
    );
  }

  destroy() {
    this.sockets.forEach(socket => {
      if (socket.connected) socket.disconnect();
    });
  }

  async getMac() {
    return new Promise<string>((resolve, reject) => {
      getmac.getMac((error, mac) => {
        if (error) reject(error);
        resolve(mac);
      });
    });
  }

  private getStatusWithPayload(payload: object) {
    let status: DeviceStatus = {
      device: {
        name: this.macAddress,
        type: this.config.type,
      },
      payload: payload,
    };
    return status;
  }

  autoStatusOn(statusCallback: () => object, interval: number) {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    this.statusInterval = setInterval(()=>this.sendStatus(statusCallback()), interval);
  }

  autoStatusOff() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = undefined;
    }
  }

  sendStatus(payload: object) {
    this.sockets.forEach(socket => {
      if (socket.connected)
        socket.emit('status', this.getStatusWithPayload(payload));
    });
  }
}
