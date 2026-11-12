import axios from 'axios'
import * as Sentry from '@sentry/node'
import { Response } from 'express'
import { Ad } from '@interfaces/ad'
import { ERROR_CODE } from '@services/api/errors'
import { DigService } from '@services/diggers/dig'
import { Website, WebsiteType } from '@services/websites/website'

jest.mock('axios')
jest.mock('@db/db', () => ({}))

const AD: Ad = {
  id: '42',
  cityLabel: 'paris',
  address: '16 boulevard voltaire',
  description: 'Appartement',
  price: 1500,
  surface: 60,
}

class WebsiteProbe extends Website {
  website: WebsiteType = 'orpi'

  async mapping(): Promise<Ad> {
    return AD
  }
}

function createWebsite() {
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() }
  const website = new WebsiteProbe(res as unknown as Response, {
    body: {
      id: AD.id,
      platform: 'chrome',
      url: 'https://www.orpi.com/annonce/42?tracking=1',
      data: '{}',
    },
  })
  return { website, res }
}

describe('Website — server error reporting', () => {
  beforeEach(() => {
    jest.mocked(axios).mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => jest.restoreAllMocks())

  it('reports the geocoding failure to Sentry with its message and stack', async () => {
    const failure = Object.assign(new Error('Gateway timeout'), {
      status: 504,
      response: { status: 504 },
    })
    jest.mocked(axios).mockRejectedValue(failure)
    const { website, res } = createWebsite()

    const error: unknown = await website.analyse().catch((err: unknown) => err)

    expect(error).toMatchObject({
      error: ERROR_CODE.ApiAdresseError,
      msg: 'Gateway timeout',
      status: 504,
      incompleteAd: {
        id: AD.id,
        website: 'orpi',
        url: 'https://www.orpi.com/annonce/42',
        city: 'paris',
      },
    })
    const client = new Sentry.NodeClient({
      integrations: [],
      transport: Sentry.makeNodeTransport,
      stackParser: Sentry.defaultStackParser,
    })
    const event = await client.eventFromException(error, {
      syntheticException: new Error('Sentry capture'),
    })

    expect(event.exception.values[0]).toMatchObject({
      type: 'Error',
      value: 'Gateway timeout',
    })
    expect(event.exception.values[0].stacktrace.frames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: expect.stringContaining('address-service.ts'),
        }),
      ]),
    )
    expect(res.json).not.toHaveBeenCalled()
  })

  it('preserves native errors when adding the ad context', async () => {
    const failure = new TypeError('Unexpected geocoding response')
    jest.spyOn(DigService.prototype, 'digInAd').mockRejectedValue(failure)
    const { website } = createWebsite()

    await expect(website.analyse()).rejects.toBe(failure)
    expect(failure).toHaveProperty('incompleteAd.id', AD.id)
  })

  it('still responds with 400 for an unsupported city', async () => {
    const { website, res } = createWebsite()
    jest
      .spyOn(website, 'mapping')
      .mockResolvedValue({ ...AD, cityLabel: 'zorglub' })

    await website.analyse()

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: ERROR_CODE.BadLocation }),
    )
    expect(axios).not.toHaveBeenCalled()
  })
})
