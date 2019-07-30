import io from 'socket.io-client';
import { DeviceServerConfig } from '../Device/Device';
import { DeviceStatus } from '../Device/Status';
import { DeviceConnectedInfo } from './Interfaces';
import { TargetConfig } from './Manager';

export default class DeviceManaged {
  private name: string;
  private type: string;
  private socket: SocketIO.Socket;
  private proxies: SocketIOClient.Socket[] = [];
  private patch: any;

  public constructor(info: DeviceConnectedInfo) {
    this.socket = info.socket;
    this.name = info.name;
    this.type = info.type;
    this.patch = require('socketio-wildcard')(io.Manager);

    this.socket.on('disconnect', () => {
      this.disconnectProxies();
    });
    this.socket.on('status', this.emitStatusToProxies.bind(this));
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
    this.disconnectProxies();
  }
  public addProxy(servers: DeviceServerConfig[]) {
    servers.forEach(config => {
      const client = io.connect(`http://${config.host}:${config.port}`, {
        query: {
          name: this.name,
          type: this.type,
        },
      });
      this.initProxyMiddleware(client)
      this.proxies.push(client);
    });
  }

  private initProxyMiddleware(proxy: SocketIOClient.Socket) {
    this.patch(proxy)
    proxy.on('*', (event: { data: any[] }) => {
      this.socket.emit(event.data.shift(), ...event.data)
    })
  }

  private emitStatusToProxies(status: DeviceStatus) {
    this.proxies.forEach(proxy => {
      proxy.emit('status', status);
    });
  }

  private disconnectProxies() {
    this.proxies.forEach(proxy => {
      proxy.disconnect();
    });
  }


}
