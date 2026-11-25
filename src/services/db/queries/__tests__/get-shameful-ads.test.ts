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
})
