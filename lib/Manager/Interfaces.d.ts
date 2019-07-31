/// <reference types="socket.io" />
import { DeviceInfo } from '../Device/Status';
export interface DeviceConnectedInfo extends DeviceInfo {
    socket: SocketIO.Socket;
}
