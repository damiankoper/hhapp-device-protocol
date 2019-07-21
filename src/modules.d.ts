declare module 'getmac' {
  function getMac(callback: (err: string, macAddress: string) => void): void;
}
