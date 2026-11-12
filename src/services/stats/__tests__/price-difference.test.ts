import { Request, Response } from 'express'
import { getClassicData } from '@services/db/queries/get-classic-data'
import { getPriceDifference } from '../price-difference'

jest.mock('@db/db', () => ({}))
jest.mock('@services/db/queries/get-classic-data', () => ({
  getClassicData: jest.fn(),
}))

const mockedGetClassicData = jest.mocked(getClassicData)

describe('getPriceDifference', () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([
    ['paris', ['75001', '75020']],
    ['lyon', ['69001', '69100']],
  ])(
    'returns a chart for %s with the corresponding postal codes',
    async (city, codes) => {
      const data = [
        { postalCode: codes[0], maxPrice: 800, priceExcludingCharges: 950 },
      ]
      mockedGetClassicData.mockResolvedValue(data)
      const req = {
        params: { city },
        query: {},
        baseUrl: '/stats',
      } as unknown as Request
      const json = jest.fn()
      const res = { json } as unknown as Response

      await expect(getPriceDifference(req, res)).resolves.toBeUndefined()

      expect(mockedGetClassicData).toHaveBeenCalledWith(
        city,
        undefined,
        { postalCode: { $exists: true }, isLegal: false },
        { maxPrice: 1, postalCode: 1, priceExcludingCharges: 1 },
      )
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { values: data },
          encoding: expect.objectContaining({
            x: expect.objectContaining({ sort: expect.arrayContaining(codes) }),
          }),
        }),
      )
      if (city === 'paris') {
        expect(json.mock.calls[0][0].encoding.x.sort).not.toContain('69100')
      }
    },
  )

  it('returns not_enough_data when no ads match', async () => {
    mockedGetClassicData.mockResolvedValue([])
    const req = {
      params: { city: 'paris' },
      query: {},
      baseUrl: '/stats',
    } as unknown as Request
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })

    await getPriceDifference(req, { status } as unknown as Response)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ message: 'not_enough_data' })
  })
})
