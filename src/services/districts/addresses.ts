import { ParisAddressItem, ParisDistrictItem } from '@interfaces/json-item-paris'
import { AddressItemDB, DefaultAddressItem, DefaultDistrictItem } from '@interfaces/shared'
import { ParisAddressStrategy, dbMapping } from '@services/address/address'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'
import { DISPLAY_ZONE_FIELD } from './districts-list'

export async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue')
  const city = req.params.city as AvailableMainCities
  const addressQuery = req.query.q

  if (addressQuery.length < 2) {
    res.json([])
    return
  }

  let data: AddressItemDB[] = await dbMapping[city]
    .find(
      {
        $text: { $search: addressQuery.toString() },
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10)
    .lean()

  const CurrentDistrictFilter = new DistrictFilterFactory(city).currentFilter()

  switch (city) {
    case 'paris':
      data = (data as ParisAddressItem[]).map((elem) => {
        const parisDistrictFilter = new CurrentDistrictFilter(
          ParisAddressStrategy.postalCodeFormat(elem.fields.c_ar.toString()),
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const district = parisDistrictFilter.getFirstDistrict() as ParisDistrictItem

        return {
          ...elem,
          districtName: district ? district.properties[DISPLAY_ZONE_FIELD] : null,
        }
      })
      break
    default:
      data = (data as DefaultAddressItem[]).map((elem) => {
        const currentDistrictFilter = new CurrentDistrictFilter(elem.code_postal, {
          lng: elem.geometry.coordinates[0],
          lat: elem.geometry.coordinates[1],
        })

        const district = currentDistrictFilter.getFirstDistrict() as DefaultDistrictItem

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero}${elem.rep || ''} ${elem.nom_voie} (${elem.code_postal})`,
          },
          districtName: district ? district.properties[DISPLAY_ZONE_FIELD] : null,
        }
      })
      break
  }

  res.json(data)
}
