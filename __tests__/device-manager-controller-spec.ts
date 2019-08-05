import {
  DeviceControllerConfig,
  DeviceController,
} from '../src/Device/DeviceController';
import { Manager } from '../src/Manager/Manager';
import { Device } from '../src/Device/Device';
describe('Device with controller through manager', () => {
  let manager: Manager;
  let device: Device;
  let deviceController: DeviceController;
  let deviceControllerConfig: DeviceControllerConfig = {
    target: {
      type: 'testtype',
    },
    manager: {
      host: 'localhost',
      port: 2199,
    },
  };
  beforeEach(done => {
    manager = new Manager({ port: 2199 });
    device = new Device({
      servers: [{ host: 'localhost', port: 2199 }],
      type: 'testtype',
    });
    deviceController = new DeviceController(deviceControllerConfig);
    done();
  });

  afterEach(done => {
    device.destroy();
    deviceController.destroy();
    manager.destroy();
    done();
  });

  it('should connect to manager', async () => {
    await deviceController.init();
    await device.init();
    expect(manager.getDevices()).toHaveLength(1);
    expect(manager.getControllers()).toHaveLength(1);
  });

  it('should connect to manager and send status', async done => {
    await deviceController.init();
    deviceController.onStatus(() => {
      done();
    });

    await device.init();
    device.sendStatus({ test: 'test' });
  });

  it('should connect to manager and send status', async done => {
    await deviceController.init();
    await device.init();
    device.onAction('testaction', () => {
      done();
    });

    deviceController.sendAction('testaction', { test: 'test' });
  });
});
