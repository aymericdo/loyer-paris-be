import { Request, Response, NextFunction } from 'express'
import * as log from '@helpers/log'
import { ParisAddress } from '@db/db'
import { ParisDistrictService } from '@services/filter-rent/paris-district'
import { ParisAddressService } from '@services/address/paris-address'

export async function getAddresses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getAddresses`, 'blue')
  const city = req.params.city
  const addressQuery = req.query.q

  console.log(addressQuery)

  if (addressQuery.length < 2) {
    res.json([])
    return
  }

  let data = []

  switch (city) {
    case 'paris':
      data = await ParisAddress.fuzzySearch(addressQuery.toString())
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
        return {
          ...elem,
          districts: parisDistrictService.getDistricts(),
        }
      })
      break
    case 'lille':
      console.log('lille')
      break
    case 'plaine_commune':
      console.log('plaine_commune')
      break
  }

  res.json(data)
}
