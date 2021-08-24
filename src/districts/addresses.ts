import { Request, Response, NextFunction } from 'express'
import * as log from '@helpers/log'
import { LilleAddress, ParisAddress, PlaineCommuneAddress } from '@db/db'
import { ParisAddressService } from '@services/address/paris-address'
import { ParisDistrictService } from '@services/filter-rent/paris-district'
import { LilleDistrictService } from '@services/filter-rent/lille-district'
import { PlaineCommuneDistrictService } from '@services/filter-rent/plaine-commune-district'

export async function getAddresses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getAddresses`, 'blue')
  const city = req.params.city
  const addressQuery = req.query.q

  if (addressQuery.length < 2) {
    res.json([])
    return
  }

  let data = []

  switch (city) {
    case 'paris':
      data = await ParisAddress.find(
        {
          $text: { $search: addressQuery.toString() },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()

      data = data.map((elem) => {
        const parisDistrictService = new ParisDistrictService(
          ParisAddressService.postalCodeFormat(elem.fields.c_ar.toString()),
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const districts = parisDistrictService.getDistricts()

        return {
          ...elem,
          districtName: districts.length ? districts[0].properties.l_qu : null,
        }
      })
      break
    case 'lille':
      data = await LilleAddress.find(
        {
          $text: { $search: addressQuery.toString() },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()

      data = data.map((elem) => {
        const lilleDistrictService = new LilleDistrictService(
          elem.code_postal,
          {
            lng: elem.lon,
            lat: elem.lat,
          }
        )

        const districts = lilleDistrictService.getDistricts()

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero} ${elem.nom_voie}`,
          },
          districtName: districts.length
            ? `Zone ${districts[0].properties.zonage}`
            : null,
        }
      })
      break
    case 'plaine_commune':
      data = await PlaineCommuneAddress.find(
        {
          $text: { $search: addressQuery.toString() },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()

      data = data.map((elem) => {
        const plaineCommuneDistrictService = new PlaineCommuneDistrictService(
          elem.code_postal,
          {
            lng: elem.lon,
            lat: elem.lat,
          }
        )

        const districts = plaineCommuneDistrictService.getDistricts()

        return {
          ...elem,
          districtName: districts.length
            ? `Zone ${districts[0].properties.Zone}`
            : null,
        }
      })
      break
  }

  res.json(data)
}
