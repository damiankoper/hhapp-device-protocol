import Device from '../src/Device/Device';
import DeviceStatus from '../src/Device/Status';
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
      done();
    });

    await device.init();
  });

  it('should send status', async done => {
    expect.assertions(1);
    let statusPayload: object = { test: 'test' };
    testServer.on('connection', socket => {
      socket.on('status', (status: DeviceStatus) => {
        expect(status.payload).toStrictEqual(statusPayload);
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
          device.autoStatusOff()
          done()
        }
      });
    });

    await device.init();
    device.autoStatusOn(() => {
      return statusPayload = { test: 'test' };
    }, 50);
  });
});
