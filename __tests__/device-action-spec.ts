import Device from '../src/Device/Device';
import SocketIO from 'socket.io';

describe('Device test', () => {
  let device: Device;

  let testServer: SocketIO.Server;
  beforeEach(done => {
    testServer = SocketIO();
    testServer.listen(2138);

    device = new Device({
      type: 'testdevice',
      servers: [
        {
          host: 'localhost',
          port: 2138,
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

  it('should respond to action sent', async done => {
    let fn = jest.fn();
    device.onAction('testaction', fn);
    testServer.on('connection', socket => {
      expect(fn).not.toBeCalled();
      socket.emit('testaction', { test: 'data' });
    });
    await device.init();
    setTimeout(() => {
      expect(fn).toBeCalled();
      done();
    }, 50);
  });

  it('should turn off action before init handler', async done => {
    let fn = jest.fn();
    device.onAction('testaction', fn);
    device.offAction('testaction');
    testServer.on('connection', socket => {
      expect(fn).not.toBeCalled();
      socket.emit('testaction', { test: 'data' });
    });
    await device.init();
    setTimeout(() => {
      expect(fn).not.toBeCalled();
      done();
    }, 50);
  });

  it('should turn off action after init handler', async done => {
    let fn = jest.fn();
    device.onAction('testaction', fn);
    testServer.on('connection', socket => {
      expect(fn).not.toBeCalled();
      socket.emit('testaction', { test: 'data' });
    });
    await device.init();
    device.offAction('testaction');
    setTimeout(() => {
      expect(fn).not.toBeCalled();
      done();
    }, 50);
  });

  it('should respond to action sent and set after init', async done => {
    let fn = jest.fn();
    testServer.on('connection', socket => {
      expect(fn).not.toBeCalled();
      setTimeout(() => {
        socket.emit('testaction', { test: 'data' });
      }, 20);
    });
    await device.init();
    device.onAction('testaction', fn);

    setTimeout(() => {
      expect(fn).toBeCalled();
      done();
    }, 50);
  });
});
