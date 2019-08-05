import {
  DeviceControllerConfig,
  DeviceController,
} from '../src/Device/DeviceController';
import SocketIO from 'socket.io';
describe('Device controller test', () => {
  let manager: SocketIO.Server = SocketIO();
  let deviceController: DeviceController;
  let deviceControllerConfig: DeviceControllerConfig = {
    target: {
      type: 'testtype',
    },
    manager: {
      host: 'localhost',
      port: 2135,
    },
  };
  beforeEach(done => {
    manager.listen(2135);
    deviceController = new DeviceController(deviceControllerConfig);
    done();
  });

  afterEach(done => {
    deviceController.destroy();
    manager.close();
    done();
  });

  it('should init', () => {
    manager.on('connection', () => {
    })
    expect(deviceController).toBeInstanceOf(DeviceController);
  });

  it('should connect to manager', async done => {
    manager.on('connection', socket => {
      expect(socket.handshake.query.controller).toBeTruthy();
      expect(socket.handshake.query.type).toEqual('testtype');
      done();
    });
    await deviceController.init();
  });

  it('should send action', async done => {
    manager.on('connection', socket => {
      socket.on('testaction', (payload: any) => {
        expect(payload.test).toEqual('test');
        done();
      });
    });
    await deviceController.init();
    deviceController.sendAction('testaction', { test: 'test' });
  });

  it('should receive status', async done => {
    let fn = jest.fn(() => {
      done();
    });
    manager.on('connection', socket => {
      socket.emit('status', {});
    });
    await deviceController.init();
    deviceController.onStatus(fn);
  });
});
