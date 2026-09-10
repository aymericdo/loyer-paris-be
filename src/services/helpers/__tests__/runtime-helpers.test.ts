import { Request } from 'express'
import { IpService } from '@services/helpers/ip'
import { virtualConsole } from '@services/helpers/jsdome'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'

describe('PrettyLog', () => {
  const originalEnv = process.env.CURRENT_ENV
  let logSpy: jest.SpyInstance

  beforeEach(() => {
    delete process.env.CURRENT_ENV
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.CURRENT_ENV = originalEnv
    logSpy.mockRestore()
  })

  it('reste muet pendant les tests', () => {
    process.env.CURRENT_ENV = 'test'

    PrettyLog.call('bonjour')

    expect(logSpy).not.toHaveBeenCalled()
  })

  it('horodate le message en ISO', () => {
    PrettyLog.call('bonjour')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatch(
      /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] bonjour$/,
    )
  })

  it.each(['red', 'blue', 'green', 'yellow'])(
    'colore le message en %s',
    (color) => {
      PrettyLog.call('bonjour', color)

      const [logged] = logSpy.mock.calls[0]

      expect(logged).toContain('bonjour')
      expect(logged).toContain('\u001b[')
    },
  )

  it('log sans couleur si elle est inconnue', () => {
    PrettyLog.call('bonjour', 'turquoise')

    expect(logSpy.mock.calls[0][0]).not.toContain('\u001b[')
  })
})

describe('Vega.commonOpt', () => {
  it('décrit la mise en page commune des graphiques', () => {
    const opt = Vega.commonOpt()

    expect(opt.$schema).toBe('https://vega.github.io/schema/vega-lite/v6.json')
    expect(opt.width).toBe(700)
    expect(opt.height).toBe(500)
    expect(opt.background).toBe('transparent')
    expect(opt.config.axis.gridOpacity).toBe(0.2)
  })
})

describe('IpService', () => {
  const fakeRequest = (forwarded?: string, remote = '10.0.0.1'): Request =>
    ({
      header: (name: string) =>
        name === 'x-forwarded-for' ? forwarded : undefined,
      connection: { remoteAddress: remote },
    }) as unknown as Request

  it('préfère l’en-tête x-forwarded-for', () => {
    expect(new IpService(fakeRequest('1.2.3.4')).ip).toBe('1.2.3.4')
  })

  it('retombe sur l’adresse de connexion', () => {
    expect(new IpService(fakeRequest(undefined, '10.0.0.7')).ip).toBe(
      '10.0.0.7',
    )
  })

  it('mémorise une adresse déjà vue', () => {
    const service = new IpService(fakeRequest('9.9.9.9'))

    expect(service.isIpCached()).toBe(false)
    expect(service.saveIp()).toBe(true)
    expect(service.isIpCached()).toBe(true)
  })
})

describe('virtualConsole', () => {
  it('laisse passer les erreurs jsdom sauf celles de feuille de style', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const vc = virtualConsole()

    vc.emit('jsdomError', { message: 'Could not parse CSS stylesheet' })
    expect(errorSpy).not.toHaveBeenCalled()

    vc.emit('jsdomError', { message: 'autre chose' })
    expect(errorSpy).toHaveBeenCalledWith({ message: 'autre chose' })

    errorSpy.mockRestore()
  })
})
