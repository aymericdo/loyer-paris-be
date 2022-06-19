import { Request, Response } from 'express'
import { PrettyLog } from '@services/helpers/pretty-log'
import { dbMapping, ParisAddressStrategy } from '@services/address/address'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { AddressItemDB, DefaultAddressItem, DefaultDistrictItem } from '@interfaces/shared'
import { ParisAddressItem, ParisDistrictItem } from '@interfaces/json-item-paris'
import { LilleDistrictItem } from '@interfaces/json-item-lille'
import { LyonEncadrementItem } from '@interfaces/json-item-lyon'

export async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue')
  const city = req.params.city as AvailableMainCities
  const addressQuery = req.query.q

  if (addressQuery.length < 2) {
    res.json([])
    return
  }

  let data: AddressItemDB[] = await dbMapping[city].find(
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

        const districts = parisDistrictFilter.getDistricts() as ParisDistrictItem[]

        return {
          ...elem,
          districtName: districts.length ? districts[0].properties.l_qu : null,
        }
      })
      break
    case 'lille':
    case 'lyon':
      data = (data as DefaultAddressItem[]).map((elem) => {
        const currentDistrictFilter = new CurrentDistrictFilter(
          elem.code_postal,
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const districts = currentDistrictFilter.getDistricts() as LyonEncadrementItem[] | LilleDistrictItem[]

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero}${elem.rep || ''} ${elem.nom_voie} (${
              elem.code_postal
            })`,
          },
          districtName: districts.length
            ? `Zone ${(districts[0] as LyonEncadrementItem | LilleDistrictItem).properties.zonage}`
            : null,
        }
      })
      break
    default:
      data = (data as DefaultAddressItem[]).map((elem) => {
        const currentDistrictFilter = new CurrentDistrictFilter(
          elem.code_postal,
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const districts = currentDistrictFilter.getDistricts() as DefaultDistrictItem[]

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero}${elem.rep || ''} ${elem.nom_voie} (${
              elem.code_postal
            })`,
          },
          districtName: districts.length
            ? `Zone ${districts[0].properties.Zone}`
            : null,
        }
      })
      break
  }

  res.json(data)
}
