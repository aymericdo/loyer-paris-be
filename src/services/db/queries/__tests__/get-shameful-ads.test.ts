import { Rent } from '@db/db'
import { getShamefulAdsData } from '../get-shameful-ads'

jest.mock('@db/db', () => ({
  Rent: { find: jest.fn() },
}))

describe('getShamefulAdsData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(Rent.find).mockResolvedValue([])
  })

  it('excludes websites omitted from the classic ads list', async () => {
    await getShamefulAdsData('paris', 100)

    expect(Rent.find).toHaveBeenCalledWith(
      expect.objectContaining({
        website: { $nin: ['bellesdemeures', 'luxresidence'] },
      }),
      expect.any(Object),
      expect.any(Object),
    )
  })

  it('looks back at the last 24 hours', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-27T19:00:00.000Z'))

    await getShamefulAdsData('paris', 100)

    jest.useRealTimers()
    expect(Rent.find).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: { $gte: new Date('2026-11-26T19:00:00.000Z') },
      }),
      expect.any(Object),
      expect.any(Object),
    )
  })
})
