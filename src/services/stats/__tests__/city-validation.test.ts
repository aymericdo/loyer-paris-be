import { Request, Response } from 'express'
import statsRouter from '@api/stats.controller'
import { Rent } from '@db/db'
import { DistrictsList } from '@services/districts/districts-list'

jest.mock('@db/db', () => ({
  Rent: { find: jest.fn(), aggregate: jest.fn() },
}))

function requestStats(url: string): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const req = { method: 'GET', url, query: {} } as unknown as Request
    const res = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code
        return this
      },
      json(body: unknown) {
        resolve({ status: this.statusCode, body })
      },
    } as unknown as Response

    statsRouter(req, res, (error) => {
      reject(error ?? new Error(`Unexpected unhandled route: ${url}`))
    })
  })
}

describe.each([
  'price-difference',
  'chloropleth-cities-map',
  'chloropleth-map',
  'map',
])('/%s/:city', (route) => {
  beforeEach(() => jest.clearAllMocks())
  afterEach(() => jest.restoreAllMocks())

  it.each(['all', 'unknown-city'])(
    'rejects %s before accessing city data',
    async (city) => {
      await expect(requestStats(`/${route}/${city}`)).resolves.toEqual({
        status: 403,
        body: { message: 'City params not valid' },
      })
      expect(Rent.find).not.toHaveBeenCalled()
      expect(Rent.aggregate).not.toHaveBeenCalled()
    },
  )

  it('still processes a supported city', async () => {
    jest.spyOn(DistrictsList.prototype, 'currentGeodata').mockResolvedValue({
      type: 'FeatureCollection',
      features: [],
    })
    jest.mocked(Rent.find).mockResolvedValue([])
    jest.mocked(Rent.aggregate).mockResolvedValue([])

    const response = await requestStats(`/${route}/lyon`)

    if (route === 'map') {
      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({ layer: expect.any(Array) }),
      )
    } else {
      expect(response).toEqual({
        status: 403,
        body: { message: 'not_enough_data' },
      })
    }
    const query =
      route === 'map' || route === 'price-difference'
        ? Rent.find
        : Rent.aggregate
    expect(query).toHaveBeenCalled()
  })
})
