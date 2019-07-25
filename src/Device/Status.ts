export interface DeviceInfo {
  type: string;
  name: string;
}

export interface DeviceStatus {
  device: DeviceInfo;
  payload: object;
}
