import { AddressItemDB, DefaultAddressItemDB } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'
import { DistrictsList } from './districts-list'
import { AddressService } from '@services/address/default-address-service'

export async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue')
  const mainCity = req.params.city as AvailableMainCities
  const city = req.query.city.toString()
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
      lng: elem.geometry.coordinates[0],
      lat: elem.geometry.coordinates[1],
    })

    const district = await currentDistrictFilter.getFirstDistrict()

    const itemAugmented = {
      ...elem,
      districtName: district ? DistrictsList.digZoneInProperties(mainCity, district['properties']) : null,
    }

    if (mainCity === 'paris') {
      return itemAugmented
    } else {
      return {
        ...itemAugmented,
        fields: {
          l_adr: `${(elem as DefaultAddressItemDB).numero}${(elem as DefaultAddressItemDB).rep || ''} `+
            `${(elem as DefaultAddressItemDB).nom_voie} (${(elem as DefaultAddressItemDB).code_postal})`,
        },
      }
    }
  })) as AddressItemDB[]

  res.json(data)
}
