import { DeviceInfo } from '../Device/Status';

export interface DeviceConnectedInfo extends DeviceInfo {
  socket: SocketIO.Socket;
}
