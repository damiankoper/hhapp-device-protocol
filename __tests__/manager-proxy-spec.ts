import Manager from '../src/Manager/Manager';
import Device, { DeviceConfig } from '../src/Device/Device';

describe('Manager test', () => {
  let manager: Manager;
  let managerTargetProxy: Manager;

  let deviceConfig: DeviceConfig = {
    type: 'testtype',
    servers: [
      {
        host: 'localhost',
        port: 2160,
      },
    ],
  };
  beforeEach(done => {
    manager = new Manager({
      port: 2160,
    });
    done();
    managerTargetProxy = new Manager({
      port: 2162,
    });
    done();
  });

  afterEach(done => {
    manager.destroy();
    managerTargetProxy.destroy();
    done();
  });

  it('should init', async done => {
    let device = new Device(deviceConfig);
    manager.proxy({
      type: 'testtype',
      servers: [
        {
          host: 'localhost',
          port: 2162
        }
      ]
    });

    managerTargetProxy.onConnection(() => {
      done();
    });

    await device.init();
  });

  it('should init after device init', async done => {
    let device = new Device(deviceConfig);
    await device.init();

    manager.proxy({
      type: 'testtype',
      servers: [
        {
          host: 'localhost',
          port: 2162
        }
      ]
    });

    managerTargetProxy.onConnection(() => {
      done();
    });
  });
});
