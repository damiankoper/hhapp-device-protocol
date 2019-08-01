import DeviceManaged from '../src/Manager/DeviceManaged';
import { Device } from '../src/Device/Device';
import SocketIO from 'socket.io';

describe('Device managed test', () => {
  let device: Device;
  let testServer: SocketIO.Server;
  let proxyTargetServer: SocketIO.Server;

  beforeEach(done => {
    testServer = SocketIO();
    testServer.listen(2150);
    proxyTargetServer = SocketIO();
    proxyTargetServer.listen(2152);

    device = new Device({
      type: 'testdevice',
      servers: [
        {
          host: 'localhost',
          port: 2150,
        },
      ],
    });
    done();
  });

  afterEach(done => {
    testServer.close();
    proxyTargetServer.close();

    device.destroy();
    done();
  });

  it('should init', async done => {
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      expect(deviceManaged).toBeInstanceOf(DeviceManaged);
      expect(deviceManaged.connected()).toEqual(true);

      deviceManaged.destroy();
      expect(deviceManaged.connected()).toEqual(false);
      done();
    });
    await device.init();
  });

  it('should matchTarget', async done => {
    let mac = await device.getMac();
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      expect(deviceManaged.matchesTarget({ type: 'testdevice' })).toBeTruthy();
      expect(deviceManaged.matchesTarget({ name: mac })).toBeTruthy();
      done();
    });
    await device.init();
  });

  it('should receive status', async done => {
    let mac = await device.getMac();
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });

      deviceManaged.onStatus(status => {
        expect(status.payload.test).toEqual('test');
        expect(status.device.name).toEqual(mac);
        expect(status.device.type).toEqual('testdevice');
        done();
      });
    });
    await device.init();
    await device.sendStatus({ test: 'test' });
  });

  it('should send action', async done => {
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      deviceManaged.sendAction('testaction', { test: 'test' });
    });
    let fn = jest.fn(() => {
      done();
    });
    device.onAction('testaction', fn);
    await device.init();
  });

  it('should create proxy', async done => {
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      deviceManaged.addProxy([
        {
          host: 'localhost',
          port: 2152,
        },
      ]);
    });
    proxyTargetServer.on('connection', () => {
      done();
    });
    await device.init();
    setTimeout(async () => await device.sendStatus({ test: 'test' }), 1000);
  });

  it('should send status by proxy', async done => {
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      deviceManaged.addProxy([
        {
          host: 'localhost',
          port: 2152,
        },
      ]);
    });
    proxyTargetServer.on('connection', socket => {
      socket.on('status', () => {
        done();
      });
    });
    await device.init();
    await device.sendStatus({ test: 'test' });
  });

  it('should send action from proxy', async done => {
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      deviceManaged.addProxy([
        {
          host: 'localhost',
          port: 2152,
        },
      ]);
    });
    proxyTargetServer.on('connection', socket => {
      socket.emit('testaction', { test: 'test' });
    });
    await device.init();
    device.onAction('testaction', () => {
      done();
    });
  });

  it('should send action from proxy target via deviceManaged', async done => {
    testServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      deviceManaged.addProxy([
        {
          host: 'localhost',
          port: 2152,
        },
      ]);
    });
    proxyTargetServer.on('connection', socket => {
      let deviceManaged = new DeviceManaged({
        socket,
        ...socket.handshake.query,
      });
      deviceManaged.sendAction('testaction', { test: 'test' });
    });
    await device.init();
    device.onAction('testaction', () => {
      done();
    });
  });
});
