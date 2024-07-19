import { DataGouvAddressItem } from '@interfaces/address'
import { AddressService } from '@services/diggers/address-service'
import { DistrictsList } from '@services/districts/districts-list'
import { AvailableMainCities, AvailableCities, mainCityList } from '@services/filters/city-filter/city-list'
import { isFake } from '@services/filters/city-filter/fake'
import { DistrictFilterFactory } from '@services/filters/district-filter/encadrement-district-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/geojson/:city', getGeodata)
async function getGeodata(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getGeodata`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  if (!mainCityList.includes(mainCity) || isFake(mainCity)) {
    res.status(403).json({ message: 'City params not valid' })
    return
  }

  const geodata = await new DistrictsList(mainCity as AvailableMainCities).currentGeodata()

  res.json(geodata)
}

router.get('/list/:city', getDistricts)
async function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  if (!mainCityList.includes(mainCity) || isFake(mainCity)) {
    res.status(403).json({ message: 'City params not valid' })
    return
  }

  const city: AvailableCities = req.query.city as AvailableCities
  const districtsItems = await new DistrictsList(mainCity as AvailableMainCities, { specificCity: city }).districtElemWithGroupBy()

  res.json(districtsItems)
}

router.get('/address/:city', getAddresses)
async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue')
  const mainCity = req.params.city as AvailableMainCities
  const city: AvailableCities = req.query.city.toString() as AvailableCities
  const addressQuery = req.query.q.toString()

  if (addressQuery.trim().length < 4) {
    res.json([])
    return
  }

  let data: DataGouvAddressItem[] = await AddressService.getAddresses(city, addressQuery)

  if (isFake(mainCity)) {
    res.json(data)
    return
  }

  const CurrentDistrictFilter = new DistrictFilterFactory(mainCity).currentDistrictFilter()

  // Add [districtName] to all elements
  data = await Promise.all(data.map(async (elem: DataGouvAddressItem) => {
    const currentDistrictFilter = new CurrentDistrictFilter({
      coordinates: {
        lng: elem.geometry.coordinates[0],
        lat: elem.geometry.coordinates[1],
      }
    })

    const district = await currentDistrictFilter.getFirstDistrict()
    return currentDistrictFilter.buildItem(district, elem)
  })) as DataGouvAddressItem[]

  res.json(data)
}

module.exports = router
