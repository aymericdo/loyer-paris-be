import { AddressItemDB } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { DistrictFilterFactory } from '@services/filters/district-filter/encadrement-district-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'
import { AddressService } from '@services/address/default-address-service'

export async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue')
  const mainCity = req.params.city as AvailableMainCities
  const city: AvailableCities = req.query.city.toString() as AvailableCities
  const addressQuery = req.query.q.toString()

  if (addressQuery.length < 2) {
    res.json([])
    return
  }

  let data: AddressItemDB[] = await AddressService.getAddresses(city, addressQuery) as AddressItemDB[]

  const CurrentDistrictFilter = new DistrictFilterFactory(mainCity).currentDistrictFilter()

  // Add [districtName] to all elements
  data = await Promise.all(data.map(async (elem: AddressItemDB) => {
    const currentDistrictFilter = new CurrentDistrictFilter({
      coordinates: {
        lng: elem.geometry.coordinates[0],
        lat: elem.geometry.coordinates[1],
      }
    })

    const district = await currentDistrictFilter.getFirstDistrict()
    return currentDistrictFilter.buildItem(district, elem)
  })) as AddressItemDB[]

  res.json(data)
}
