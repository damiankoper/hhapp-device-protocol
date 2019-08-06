import {
  DeviceControllerConfig,
  DeviceController,
} from '../src/Device/DeviceController';
import SocketIO from 'socket.io';
import DeviceControllerManaged from '../src/Manager/DeviceControllerManaged';
describe('Device controller managed test', () => {
  let manager: SocketIO.Server = SocketIO();
  let deviceController: DeviceController;
  let deviceControllerConfig: DeviceControllerConfig = {
    target: {
      type: 'testtype',
    },
    manager: {
      host: 'localhost',
      port: 2133,
    },
  };
  beforeEach(done => {
    manager.listen(2133);
    deviceController = new DeviceController(deviceControllerConfig);
    done();
  });

  afterEach(done => {
    deviceController.destroy();
    manager.close();
    done();
  });

  it('should init', async done => {
    done()
    manager.on('connection', socket => {
      let deviceControllerManaged = new DeviceControllerManaged(
        {
          socket,
          ...deviceController.getTargetConfig(),
        },
        []
      );
      expect(deviceControllerManaged.connected()).toBeTruthy();

      done();
    });
    await deviceController.init();
  });

   it('should send status', async done => {
      manager.on('connection', socket => {
        let deviceControllerManaged = new DeviceControllerManaged(
          {
            socket,
            ...deviceController.getTargetConfig(),
          },
          []
        );
        deviceControllerManaged.sendStatus({
          device: { type: 'testtype', name: 'testname' },
          payload: {},
        });
        deviceControllerManaged.destroy();
        expect(deviceControllerManaged.connected()).toBeFalsy();
      });
      await deviceController.init();
      deviceController.onStatus(status => {
        expect(status.device.name).toEqual('testname');
        done();
      });
    });
/*
    it('should send status', async done => {
      manager.on('connection', socket => {
        let deviceControllerManaged = new DeviceControllerManaged(
          {
            socket,
            ...deviceController.getTargetConfig(),
          },
          []
        );
        expect(socket).toStrictEqual(deviceControllerManaged.getSocket());
        done();
      });
      await deviceController.init();
    }); */
});
