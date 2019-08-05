import io from 'socket.io-client';
import { DeviceStatus } from './Status';
import { DeviceServerConfig } from './Device';
import { TargetConfig } from '../Manager/Manager';
export { DeviceStatus } from './Status';

export interface DeviceControllerConfig {
  target: TargetConfig,
  manager: DeviceServerConfig
}

export class DeviceController {
  private socket?: SocketIOClient.Socket;
  private config: DeviceControllerConfig;

  constructor(config: DeviceControllerConfig) {
    this.config = config;
  }

  public async init() {
    this.socket = await new Promise<SocketIOClient.Socket>((resolve, reject) => {
      const serverConfig = this.config.manager
      const socket = io.connect(
        `http://${serverConfig.host}:${serverConfig.port}`,
        {
          query: {
            controller: true,
            ...this.config.target,
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
  }

  public getTargetConfig(): TargetConfig {
    return this.config.target
  }

  public destroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public onStatus(fn: (status: DeviceStatus) => void) {
    if (this.socket)
      this.socket.on('status', fn)
  }

  public sendAction(action: string, payload: any) {
    if (this.socket)
      this.socket.emit(action, payload)
  }
}
