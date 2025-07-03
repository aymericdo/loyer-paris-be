import {
  DataGouvAddressItem,
  FinalDataGouvAddressItem,
} from '@interfaces/address'
import { paramMiddleware, queryParamValidator } from '@services/api/validations'
import { AddressService } from '@services/diggers/address-service'
import { DistrictsList } from '@services/districts/districts-list'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import express, { Request, Response } from 'express'
import { AvailableCities } from '@services/city-config/classic-cities'
import { isFake } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { ZoneDocument } from '@db/zone.model'
const router = express.Router()

router.get(
  '/geojson/:city',
  paramMiddleware({ allAccepted: false, fakeAccepted: true }),
  getGeodata,
)
async function getGeodata(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getGeodata`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities

  const geodata = await new DistrictsList(
    mainCity as AvailableMainCities,
  ).currentGeodata()

  res.json(geodata)
}

router.get('/list/:city', paramMiddleware(), getDistricts)
async function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities

  const city: AvailableCities = queryParamValidator(
    req.query.city as string,
  ) as AvailableCities

  if (!city) {
    res.status(403).send('missing params')
    return
  }

  const districtsItems = await new DistrictsList(
    mainCity as AvailableMainCities,
    {
      specificCity: city,
    },
  ).districtElemWithGroupBy()

  res.json(districtsItems)
}

router.get('/address/:city', paramMiddleware(), getAddresses)
async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue')
  const mainCity = req.params.city as AvailableMainCities

  const city: AvailableCities = queryParamValidator(
    req.query.city as string,
  ) as AvailableCities
  const addressQuery = queryParamValidator(req.query.q as string)

  if (!city) {
    res.status(403).send('missing params')
    return
  }

  if (addressQuery.trim().length < 4) {
    res.json([])
    return
  }

  let data: DataGouvAddressItem[] = []
  try {
    data = await AddressService.getAddresses(city, addressQuery)
  } catch (_error) {
    res.json(data)
    return
  }

  if (isFake(mainCity)) {
    res.json(data)
    return
  }

  const districtFilterFactory = new DistrictFilterFactory(mainCity)

  // Add [districtName] to all elements
  data = (await Promise.all(
    data.map(async (elem: DataGouvAddressItem) => {
      const currentDistrictFilter = districtFilterFactory.currentDistrictFilter(
        {
          coordinates: {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          },
        },
      )

      const district: ZoneDocument =
        await currentDistrictFilter.getFirstDistrict()

      return {
        ...elem,
        districtName: district
          ? currentDistrictFilter.digZoneInProperties(district.properties)
          : null,
      }
    }),
  )) as FinalDataGouvAddressItem[]

  res.json(data)
}

export default router
