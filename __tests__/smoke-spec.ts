import { Manager, Device } from '../src/index'

describe('Smoke tests', () => {
  it('should have Manager globally available', () => {
    let manager = new Manager({ port: 2222 })

    expect(manager).toBeInstanceOf(Manager)

    manager.destroy()
  })

  it('should have Device globally available', () => {
    let device = new Device({ type: 'test', servers: [] })

    expect(device).toBeInstanceOf(Device)
  })
})
