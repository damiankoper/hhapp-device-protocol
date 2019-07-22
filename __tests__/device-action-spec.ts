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

  it('should pass',()=>{

  })
/*   it('should respond to action sent', async done => {

    let fn = jest.fn()
    device.on('testaction', fn)

    testServer.on('connection', socket => {
      expect(fn).toBeCalledTimes(1)

      socket.emit('testaction', { test: 'data' })
      done()
    });

    await device.init();
  }); */
});
