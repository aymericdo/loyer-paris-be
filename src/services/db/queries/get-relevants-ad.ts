import { Rent } from '@db/db'
import { AvailableCities } from '@services/city-config/cities'
import { AvailableCityZones, getMainCity, isFake } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { getMainCityFilter, getClassicWebsiteFilter, getDistrictFilter, getExceedingFilter, getFurnitureFilter, getHouseFilter, getPriceFilter, getRoomFilter, getSurfaceFilter, getCityFilter } from '@services/db/queries/common'
import { DistrictsList } from '@services/districts/districts-list'
import { roundNumber } from '@services/helpers/round-number'
import randomPositionInPolygon from 'random-position-in-polygon'

interface RelevantAdsData {
  id: string
  surface: number
  roomCount: number
  website: string
  createdAt: Date
  hasFurniture: boolean
  price: number
  maxPrice: number
  priceExcludingCharges: number
  isLegal: boolean
  url: string
  district: string
  city: AvailableCities
  longitude: string
  latitude: string
  isHouse: boolean
  blurry: boolean
}

function buildFilter(filterParam: {
  mainCity: AvailableMainCities | 'all'
  city: AvailableCities | 'all'
  districtList: AvailableCityZones
  surfaceRange: [number, number]
  priceRange: [number, number]
  exceedingRange: [number, number]
  roomRange: [number, number]
  hasFurniture: boolean
  isHouse: boolean
  isLegal: boolean
}) {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 7))

  const filter = {
    isLegal: filterParam.isLegal,
    createdAt: { $gte: minDate },
    ...getClassicWebsiteFilter(),
    ...(filterParam.city ? getCityFilter(filterParam.city) : getMainCityFilter(filterParam.mainCity)),
    ...getDistrictFilter(filterParam.districtList),
    ...getFurnitureFilter(filterParam.hasFurniture),
    ...getHouseFilter(filterParam.isHouse),
    ...getSurfaceFilter(filterParam.surfaceRange),
    ...getPriceFilter(filterParam.priceRange),
    ...getRoomFilter(filterParam.roomRange),
    ...getExceedingFilter(filterParam.exceedingRange),
  }

  return filter
}

function randomPointInGeometryCollection(geometryCollection) {
  const polygons = geometryCollection.geometries.filter(geom =>
    geom.type === 'Polygon' || geom.type === 'MultiPolygon'
  )

  if (polygons.length === 0) return null

  const randomPolygon = polygons[Math.floor(Math.random() * polygons.length)]
  return randomPositionInPolygon({
    type: 'Feature',
    geometry: {
      ...randomPolygon,
    }
  })
}

export async function getRelevantAdsData(
  filterParam: {
    mainCity: AvailableMainCities | 'all'
    city: AvailableCities | 'all'
    districtList: AvailableCityZones
    surfaceRange: [number, number]
    priceRange: [number, number]
    exceedingRange: [number, number]
    roomRange: [number, number]
    hasFurniture: boolean
    isHouse: boolean
    isLegal: boolean
  },
  paginationOpts?: {
    page: number
    perPage: number
  }
): Promise<RelevantAdsData[]> {
  const page = paginationOpts?.page || 0
  const perPage = paginationOpts?.perPage || 20

  const filter = buildFilter(filterParam)

  const ads = (await Rent.find(
    filter,
    {
      id: 1,
      surface: 1,
      roomCount: 1,
      website: 1,
      createdAt: 1,
      hasFurniture: 1,
      price: 1,
      maxPrice: 1,
      isLegal: 1,
      priceExcludingCharges: 1,
      district: 1,
      url: 1,
      city: 1,
      isHouse: 1,
      longitude: 1,
      latitude: 1,
    },
    {
      sort: { createdAt: -1 },
      skip: page * perPage,
      limit: perPage,
    }
  ).lean()) as unknown as RelevantAdsData[]

  return await Promise.all(ads.map(async (ad) => {
    let blurry = false

    const mainCity = getMainCity(ad.city)
    if (mainCity && !isFake(mainCity) && (!ad.longitude || !ad.latitude)) {
      const geodata = await new DistrictsList(mainCity, { specificCity: ad.city }).currentGeodata()
      const feature = geodata.features[Math.floor(Math.random() * geodata.features.length)]

      let point = null

      if (feature) {
        if (feature.geometry.type === 'GeometryCollection') {
          point = randomPointInGeometryCollection(feature.geometry)
        } else {
          point = randomPositionInPolygon(feature)
        }

        if (point) {
          ad.longitude = point[0]
          ad.latitude = point[1]
        }
      }

      blurry = true
    }

    const exceeding = !ad.isLegal ? roundNumber(ad.priceExcludingCharges - ad.maxPrice) : null
    delete ad.isLegal
    delete ad.priceExcludingCharges
    delete ad.maxPrice

    return {
      ...ad,
      blurry,
      exceeding,
    }
  }).filter(Boolean))
}

export async function getRelevantAdsDataTotalCount(filterParam: {
  mainCity: AvailableMainCities | 'all'
  city: AvailableCities | 'all'
  districtList: AvailableCityZones
  surfaceRange: [number, number]
  priceRange: [number, number]
  exceedingRange: [number, number]
  roomRange: [number, number]
  hasFurniture: boolean
  isHouse: boolean
  isLegal: boolean
}) {
  const filter = buildFilter(filterParam)
  return await Rent.countDocuments(filter)
}