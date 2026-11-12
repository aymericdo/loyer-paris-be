import axios from 'axios'
import { Ad } from '@interfaces/ad'
import { ApiErrorsService, ERROR_CODE } from '@services/api/errors'
import { AvailableCities } from '@services/city-config/classic-cities'
import { AddressService } from '@services/diggers/address-service'
import { DigService } from '@services/diggers/dig'

jest.mock('axios')
jest.mock('@db/db', () => ({}))

const ad: Ad = {
  id: '2667QSIKZMGT',
  cityLabel: 'ramonville-saint-agne',
  address: '16 rue des fleurs',
  description: 'Appartement de trois pièces',
  price: 1500,
  surface: 60,
  rooms: 3,
  yearBuilt: 1990,
}

describe('DigService — unavailable address API', () => {
  beforeEach(() => {
    jest.mocked(axios).mockReset()
    jest.mocked(axios).mockRejectedValue(
      Object.assign(new Error('Request failed with status code 504'), {
        status: 504,
        response: { status: 504 },
      }),
    )
  })
  afterEach(() => jest.restoreAllMocks())

  it.each<[AvailableCities, string | undefined, string]>([
    ['ramonville-saint-agne', undefined, '31520'],
    ['paris', '75011', '75011'],
  ])(
    'continues with the known postal code in %s',
    async (city, postalCode, expectedCode) => {
      const service = new DigService({ ...ad, cityLabel: city, postalCode })

      await expect(service.digInAd(city)).resolves.toMatchObject({
        city,
        postalCode: expectedCode,
        address: null,
        coordinates: null,
        blurryCoordinates: null,
        price: ad.price,
        surface: ad.surface,
      })
      expect(axios).toHaveBeenCalledTimes(1)
    },
  )

  it('preserves the 504 when no postal code is known', async () => {
    const service = new DigService({ ...ad, cityLabel: 'paris' })
    const error: unknown = await service
      .digInAd('paris')
      .catch((err: unknown) => err)

    expect(error).toBeInstanceOf(Error)
    expect(error).toMatchObject({
      error: ERROR_CODE.ApiAdresseError,
      msg: 'Request failed with status code 504',
      status: 504,
    })
    expect(new ApiErrorsService(error as never).status).toBe(504)
  })

  it('preserves the upstream status when Axios only provides response.status', async () => {
    jest.mocked(axios).mockRejectedValue({
      message: 'Request failed with status code 504',
      response: { status: 504 },
    })

    await expect(
      AddressService.getAddresses('paris', ad.address),
    ).rejects.toMatchObject({
      error: ERROR_CODE.ApiAdresseError,
      status: 504,
    })
  })

  it('propagates unexpected failures even with a known postal code', async () => {
    const error = new TypeError('Unexpected address response')
    jest.spyOn(AddressService.prototype, 'getAddress').mockRejectedValue(error)

    await expect(
      new DigService(ad).digInAd('ramonville-saint-agne'),
    ).rejects.toBe(error)
  })
})
