import Device from '../src/Device/Device';
import { DeviceStatus } from '../src/Device/Status';
import SocketIO from 'socket.io';

describe('Device test', () => {
  let device: Device;

  let testServer: SocketIO.Server;
  beforeEach(done => {
    testServer = SocketIO();
    testServer.listen(2137);

    device = new Device({
      type: 'testdevice',
      servers: [
        {
          host: 'localhost',
          port: 2137,
        },
      ],
    });
    done();
  });

  afterEach(done => {
    testServer.close();
    device.destroy();
    done();
  });

  it('should init', async () => {
    await expect(device.getMac()).resolves.toMatch(
      /.{2}:.{2}:.{2}:.{2}:.{2}:.{2}/
    );
  });

  it('should connect', async done => {
    testServer.on('connection', socket => {
      expect(socket.connected).toBeTruthy();
      expect(socket.handshake.query.name).toMatch(
        /.{2}:.{2}:.{2}:.{2}:.{2}:.{2}/
      );
      done();
    });
    await device.init();
  });

  it('should connect and be destroyed', async done => {
    testServer.on('connection', socket => {
      expect(socket.connected).toBeTruthy();
      socket.on('disconnect', () => {
        expect(socket.connected).toBeFalsy();
        done();
      });
      device.destroy();
    });
    await device.init();
  });

  it('should send status', async done => {
    expect.assertions(3);
    let statusPayload: object = { test: 'test' };
    testServer.on('connection', socket => {
      socket.on('status', (status: DeviceStatus) => {
        expect(status.payload).toStrictEqual(statusPayload);
        expect(status.device.name).toMatch(/.{2}:.{2}:.{2}:.{2}:.{2}:.{2}/);
        expect(status.device.type).toBe('testdevice');
        done();
      });
      device.sendStatus(statusPayload);
    });

    await device.init();
  });

  it('should send status with interval', async done => {
    expect.assertions(3);
    let counter = 0;
    let statusPayload: object;
    testServer.on('connection', socket => {
      socket.on('status', (status: DeviceStatus) => {
        expect(status.payload).toStrictEqual(statusPayload);
        if (++counter === 3) {
          device.autoStatusOff();
          done();
        }
      });
    });

    await device.init();
    device.setStatusGetter(() => {
      return (statusPayload = { test: 'test' });
    });
    device.autoStatusOn(50);
    // New call replaces old interval
    device.autoStatusOn(60);
  });
});
