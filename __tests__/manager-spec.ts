import { Manager } from '../src/Manager/Manager';
import { Device, DeviceConfig, DeviceStatus } from '../src/Device/Device';
import DeviceManaged from '../src/Manager/DeviceManaged';

describe('Manager test', () => {
  let manager: Manager;
  let deviceConfig: DeviceConfig = {
    type: 'testtype',
    servers: [
      {
        host: 'localhost',
        port: 2139,
      },
    ],
  };
  beforeEach(done => {
    manager = new Manager({
      port: 2139,
    });
    done();
  });

  afterEach(done => {
    manager.destroy();
    done();
  });

  it('should init', async () => {
    expect(manager).toBeInstanceOf(Manager);
  });

  it('should have no connected devices', async () => {
    expect(manager.getDevices().length).toBe(0);
  });

  it('should have device connected', async done => {
    let fn = jest.fn((device: DeviceManaged) => {
      expect(fn).toBeCalled();
      expect(device.getName()).toMatch(/.{2}:.{2}:.{2}:.{2}:.{2}:.{2}/);
      expect(device.getType()).toEqual('testtype');
      done();
    });
    manager.onConnection(fn);

    let device = new Device(deviceConfig);
    await device.init();
  });

  it('should call device status handler', async done => {
    let fn2 = jest.fn(() => {});
    let fn = jest.fn((status: DeviceStatus) => {
      expect(fn).toBeCalled();
      expect(status.device.name).toMatch(/.{2}:.{2}:.{2}:.{2}:.{2}:.{2}/);
      expect(status.device.type).toEqual('testtype');
      expect(fn2).toBeCalledTimes(0);
      done();
    });
    manager.onStatus({ type: 'anothertesttype' }, fn2);
    manager.onStatus({ type: 'testtype' }, fn);

    let device = await new Device(deviceConfig);
    await device.init();
    device.sendStatus({ test: 'test' });
  });

  it('should call off device status handler after init', async done => {
    let fn = jest.fn(() => {});

    let device = await new Device(deviceConfig);
    await device.init();

    setTimeout(() => {
      manager.onStatus({ type: 'testtype' }, fn);
      manager.offStatus({ type: 'testtype' }, fn);
      device.sendStatus({ test: 'test' });
      setTimeout(() => {
        expect(fn).toBeCalledTimes(0);
        done();
      }, 10);
    }, 10);
  });

  it('should send action', async done => {
    let fn = jest.fn((payload: any) => {
      expect(fn).toBeCalled();
      expect(payload.test).toEqual('test');
      done();
    });

    let device = await new Device(deviceConfig);
    device.onAction('testaction', fn);
    await device.init();
    manager.sendAction(
      {
        action: 'testaction',
        type: 'testtype',
      },
      { test: 'test' }
    );
  });

  it('should send action minimal config', async done => {
    let fn = jest.fn((payload: any) => {
      expect(fn).toBeCalled();
      expect(payload.test).toEqual('test');
      done();
    });

    let device = await new Device(deviceConfig);
    device.onAction('testaction', fn);
    await device.init();
    manager.sendAction(
      { type: 'testtype', action: 'testaction' },
      { test: 'test' }
    );
  });

  it('should send action name config', async done => {
    let fn = jest.fn((payload: any) => {
      expect(fn).toBeCalled();
      expect(payload.test).toEqual('test');
      done();
    });

    let device = await new Device(deviceConfig);
    device.onAction('testaction', fn);
    await device.init();
    manager.sendAction(
      { action: 'testaction', name: await device.getMac() },
      { test: 'test' }
    );
  });

  it('should send action type config', async done => {
    let fn = jest.fn((payload: any) => {
      expect(fn).toBeCalled();
      expect(payload.test).toEqual('test');
      done();
    });

    let device = await new Device(deviceConfig);
    device.onAction('testaction', fn);
    await device.init();
    manager.sendAction(
      { action: 'testaction', type: 'testtype' },
      { test: 'test' }
    );
  });

  it('should throw error action wrong name config', async done => {
    let fn = jest.fn();
    let device = await new Device(deviceConfig);
    device.onAction('testaction', fn);
    await device.init();
    expect(() =>
      manager.sendAction(
        { action: 'testaction', name: 'unknownname' },
        { test: 'test' }
      )
    ).toThrowError();
    setTimeout(() => {
      expect(fn).not.toBeCalled();
      done();
    }, 10);
  });

  it('should throw error action wrong type config', async done => {
    let fn = jest.fn();
    let device = await new Device(deviceConfig);
    device.onAction('testaction', fn);
    await device.init();
    expect(() =>
      manager.sendAction(
        { action: 'testaction', type: 'unknowntype' },
        { test: 'test' }
      )
    ).toThrowError();
    setTimeout(() => {
      expect(fn).not.toBeCalled();
      done();
    }, 10);
  });
});
