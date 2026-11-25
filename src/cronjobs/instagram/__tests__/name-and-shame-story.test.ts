import { getShamefulAdsData } from '@services/db/queries/get-shameful-ads'
import {
  NameAndShameStory,
  selectHighestExceedingAd,
} from '../name-and-shame-story'

jest.mock('@services/db/queries/get-shameful-ads', () => ({
  getShamefulAdsData: jest.fn(),
}))

describe('selectHighestExceedingAd', () => {
  it('selects the highest excess above 100 euros', () => {
    const candidates = [
      {
        city: 'Paris',
        website: 'leboncoin',
        observedPrice: 1200,
        maxPrice: 1090,
        excess: 110,
      },
      {
        city: 'Lille',
        website: 'leboncoin',
        observedPrice: 1300,
        maxPrice: 1150,
        excess: 150,
      },
    ]

    expect(selectHighestExceedingAd(candidates)).toEqual(candidates[1])
  })

  it('does not select an ad at or below 100 euros over the limit', () => {
    expect(
      selectHighestExceedingAd([
        {
          city: 'Paris',
          website: 'leboncoin',
          observedPrice: 1200,
          maxPrice: 1100,
          excess: 100,
        },
      ]),
    ).toBeUndefined()
  })

  it('returns no candidate for an empty list', () => {
    expect(selectHighestExceedingAd([])).toBeUndefined()
  })

  it('does not publish when none of the seven territories has an eligible ad', async () => {
    jest.mocked(getShamefulAdsData).mockResolvedValue([])
    const fetch = jest.spyOn(global, 'fetch')

    await new NameAndShameStory().call()

    expect(getShamefulAdsData).toHaveBeenCalledTimes(7)
    expect(getShamefulAdsData).toHaveBeenCalledWith('paris', 100)
    expect(fetch).not.toHaveBeenCalled()
    fetch.mockRestore()
  })
})
