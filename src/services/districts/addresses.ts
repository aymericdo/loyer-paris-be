import { ParisAddressItemDB, ParisDistrictItem } from '@interfaces/json-item-paris'
import { AddressItemDB, DefaultAddressItemDB, DefaultDistrictItem } from '@interfaces/shared'
import { ParisAddressStrategy, dbMapping } from '@services/address/address'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'
import { DistrictsList } from './districts-list'

export async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue')
  const city = req.params.city as AvailableMainCities
  const addressQuery = req.query.q.toString()

  if (addressQuery.length < 2) {
    res.json([])
    return
  }

  let data: AddressItemDB[] = await dbMapping[city]
    .find(
      {
        $text: { $search: addressQuery },
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10)
    .lean()

  const CurrentDistrictFilter = new DistrictFilterFactory(city).currentFilter()

  switch (city) {
    case 'paris':
      data = await Promise.all((data as ParisAddressItemDB[]).map(async (elem) => {
        const parisDistrictFilter = new CurrentDistrictFilter(
          city,
          ParisAddressStrategy.postalCodeFormat(elem.fields.c_ar.toString()),
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const district = await parisDistrictFilter.getFirstDistrict() as ParisDistrictItem

        return {
          ...elem,
          districtName: district ? DistrictsList.digZoneInProperties(city, district['properties']) : null,
        }
      }))
      break
    default:
      data = await Promise.all((data as DefaultAddressItemDB[]).map(async (elem) => {
        const currentDistrictFilter = new CurrentDistrictFilter(
          elem.nom_commune,
          elem.code_postal, {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const district = await currentDistrictFilter.getFirstDistrict() as DefaultDistrictItem

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero}${elem.rep || ''} ${elem.nom_voie} (${elem.code_postal})`,
          },
          districtName: district ? DistrictsList.digZoneInProperties(city, district['properties']) : null,
        }
      }))
      break
  }

  res.json(data)
}
