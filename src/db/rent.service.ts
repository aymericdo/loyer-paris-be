import { Rent } from '@db/db'
import { DataBaseItem } from '@interfaces/database-item'
import { AvailableMainCities, cityList } from '@services/address/city'
import { DistrictsList } from '@services/districts/districts-list'
import { roundNumber } from '@services/helpers/round-number'
import { FUNNIEST_WEBSITES } from '@services/websites/website'
import randomPositionInPolygon from 'random-position-in-polygon'

function getCity(city: AvailableMainCities) {
  const cities = Object.keys(cityList).filter((c) => cityList[c].mainCity === city)
  return { $in: cities }
}

export async function getMapData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; latitude: number; longitude: number; district: string }[]> {
  const filter = {
    latitude: { $exists: true },
    longitude: { $exists: true },
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }

  try {
    return (await Rent.find(filter, {
      isLegal: 1,
      latitude: 1,
      longitude: 1,
      district: 1,
    })) as unknown as {
      isLegal: boolean
      latitude: number
      longitude: number
      district: string
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getChloroplethMapData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; district: string }[]> {
  const filter = {
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }

  try {
    return await Rent.find(filter, { isLegal: 1, district: 1 }).lean()
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getPriceDiffData(
  city: string,
  dateRange: string[]
): Promise<{ maxPrice: number; postalCode: string; priceExcludingCharges: number }[]> {
  const filter = {
    postalCode: { $exists: true },
    isLegal: false,
    priceExcludingCharges: { $lte: 10000 },
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }

  try {
    return (await Rent.find(filter, {
      maxPrice: 1,
      postalCode: 1,
      priceExcludingCharges: 1,
    })) as unknown as {
      maxPrice: number
      postalCode: string
      priceExcludingCharges: number
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getLegalVarData(
  city: string,
  districtList: string[],
  surfaceRange: number[],
  roomRange: number[],
  hasFurniture: boolean,
  dateRange: string[],
  isParticulier: boolean | null
): Promise<
  {
    isLegal: boolean
    createdAt: string
  }[]
> {
  const filter = {
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (districtList?.length) {
    filter['district'] = { $in: districtList }
  }

  if (hasFurniture !== null) {
    filter['hasFurniture'] = hasFurniture
  }

  if (surfaceRange?.length) {
    filter['surface'] = { $gte: surfaceRange[0], $lte: surfaceRange[1] }
  }

  if (roomRange?.length) {
    filter['roomCount'] = { $gte: roomRange[0], $lte: roomRange[1] }
  }

  if (dateRange?.length) {
    filter['createdAt'] = { $gte: dateRange[0], $lte: dateRange[1] }
  }

  if (isParticulier !== null) {
    if (isParticulier) {
      filter['renter'] = 'Particulier'
    } else {
      filter['renter'] = { $ne: 'Particulier', $exists: true }
    }
  }

  try {
    return (await Rent.find(filter, {
      createdAt: 1,
      isLegal: 1,
    })) as unknown as {
      isLegal: boolean
      createdAt: string
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getPriceVarData(
  city: string,
  dateRange: string[]
): Promise<
  {
    maxPrice: number
    createdAt: string
    priceExcludingCharges: number
  }[]
> {
  const filter = {
    isLegal: false,
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }

  try {
    return (await Rent.find(filter, {
      createdAt: 1,
      maxPrice: 1,
      priceExcludingCharges: 1,
    })) as unknown as {
      createdAt: string
      maxPrice: number
      priceExcludingCharges: number
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getLegalPerClassicRenterData(
  city: string,
  dateRange: string[],
  renterNameRegex: RegExp,
  website?: string
): Promise<{ isLegal: boolean; renter: string }[]> {
  const filter = {
    surface: { $lte: 100 },
  }

  if (website) {
    filter['$or'] = [{ renter: { $regex: renterNameRegex } }, { website }]
  } else {
    filter['renter'] = { $regex: renterNameRegex }
    filter['website'] = { $nin: FUNNIEST_WEBSITES }
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }
  try {
    return (await Rent.find(filter, {
      isLegal: 1,
      renter: 1,
    }).lean()) as unknown as { isLegal: boolean; renter: string }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getLegalPerRenterData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; renter: string }[]> {
  const filter = {
    renter: { $exists: true },
    surface: { $lte: 100 },
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }
  try {
    return (await Rent.find(filter, { isLegal: 1, renter: 1 })) as unknown as {
      isLegal: boolean
      renter: string
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getLegalPerDPEData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; dpe: string }[]> {
  const filter = {
    dpe: { $exists: true },
    surface: { $lte: 100 },
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }
  try {
    return (await Rent.find(filter, { isLegal: 1, dpe: 1 })) as unknown as {
      isLegal: boolean
      dpe: string
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getLegalPerWebsiteData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; website: string }[]> {
  const filter = {
    surface: { $lte: 100 },
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }
  try {
    return (await Rent.find(filter, {
      isLegal: 1,
      website: 1,
    }).lean()) as unknown as {
      isLegal: boolean
      website: string
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getLegalPerSurfaceData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; surface: number }[]> {
  const filter = {
    surface: { $lte: 100 },
    website: { $nin: FUNNIEST_WEBSITES },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }
  try {
    return (await Rent.find(filter, { isLegal: 1, surface: 1 })) as unknown as {
      isLegal: boolean
      surface: number
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getAdoptionData(): Promise<{ createdAt: string }[]> {
  try {
    return (await Rent.find({}, { createdAt: 1 })) as unknown as {
      createdAt: string
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getWelcomeData(city: string = null): Promise<{ isLegal: boolean; surface: number }[]> {
  const filter = {}

  if (city && city !== 'all') {
    filter['city'] = getCity(city as AvailableMainCities)
  }

  try {
    return (await Rent.find(filter, { isLegal: 1, surface: 1 })) as unknown as {
      isLegal: boolean
      surface: number
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

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
  city: string
  longitude: string
  latitude: string
  isHouse: boolean
  blurry: boolean
}

export async function getRelevantAdsData(
  filterParam: {
    city: string
    districtList: string[]
    surfaceRange: number[]
    priceRange: number[]
    exceedingRange: number[]
    roomRange: number[]
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

  console.log(filter)

  try {
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

    console.log(ads)

    return ads.map((ad) => {
      let blurry = false

      if (!ad.longitude || !ad.latitude) {
        const mainCity = cityList[ad.city].mainCity

        const polygon = new DistrictsList(mainCity as AvailableMainCities).currentPolygon(ad.district)

        const point = randomPositionInPolygon({
          type: 'Feature',
          geometry: polygon,
        })

        ad.longitude = point[0]
        ad.latitude = point[1]
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
    })
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getRelevantAdsDataTotalCount(filterParam: {
  city: string
  districtList: string[]
  surfaceRange: number[]
  priceRange: number[]
  exceedingRange: number[]
  roomRange: number[]
  hasFurniture: boolean
  isHouse: boolean
  isLegal: boolean
}) {
  const filter = buildFilter(filterParam)
  return await Rent.countDocuments(filter)
}

function buildFilter(filterParam: {
  city: string
  districtList: string[]
  surfaceRange: number[]
  priceRange: number[]
  exceedingRange: number[]
  roomRange: number[]
  hasFurniture: boolean
  isHouse: boolean
  isLegal: boolean
}) {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 7))

  const filter = { isLegal: filterParam.isLegal, createdAt: { $gte: minDate } }

  if (filterParam.city !== 'all') {
    filter['city'] = getCity(filterParam.city as AvailableMainCities)
  }

  if (filterParam.districtList?.length) {
    filter['district'] = { $in: filterParam.districtList }
  }

  if (filterParam.hasFurniture !== null) {
    filter['hasFurniture'] = filterParam.hasFurniture
  }

  if (filterParam.isHouse !== null) {
    filter['isHouse'] = filterParam.isHouse
  }

  if (filterParam.surfaceRange?.length) {
    filter['surface'] = {
      $gte: filterParam.surfaceRange[0],
      $lte: filterParam.surfaceRange[1],
    }
  }

  if (filterParam.priceRange?.length) {
    filter['price'] = {
      $gte: filterParam.priceRange[0],
      $lte: filterParam.priceRange[1],
    }
  }

  if (filterParam.roomRange?.length) {
    filter['roomCount'] = {
      $gte: filterParam.roomRange[0],
      $lte: filterParam.roomRange[1],
    }
  }

  if (filterParam.exceedingRange?.length) {
    filter['$expr'] = {
      $and: [
        { $lte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, filterParam.exceedingRange[1]] },
        { $gte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, filterParam.exceedingRange[0]] },
      ],
    }
  }

  return filter
}

export async function getAdById(id: string, website: string): Promise<DataBaseItem> {
  try {
    return (await Rent.findOne({
      id,
      website,
    })) as unknown as Promise<DataBaseItem>
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getShamefulAdsData(
  city: string,
  maxDelta = 200
): Promise<
  {
    url: string
    website: string
    priceExcludingCharges: number
    maxPrice: number
  }[]
> {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 7))

  const filter = {
    isLegal: false,
    createdAt: { $gte: minDate },
    city: getCity(city as AvailableMainCities),
    $expr: {
      $gte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, maxDelta],
    },
  }

  try {
    return (await Rent.find(
      filter,
      {
        website: 1,
        priceExcludingCharges: 1,
        maxPrice: 1,
        url: 1,
      },
      {
        sort: { createdAt: -1 },
      }
    )) as unknown as {
      url: string
      website: string
      priceExcludingCharges: number
      maxPrice: number
    }[]
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

export async function getCountByWebsite(): Promise<{
  [website: string]: number
}> {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 1))

  try {
    return (
      (await Rent.aggregate([
        {
          $match: { createdAt: { $gte: minDate } },
        },
        {
          $group: {
            _id: { website: '$website' },
            count: {
              $sum: 1,
            },
          },
        },
      ])) as unknown as {
        _id: { website: string }
        count: number
      }[]
    ).reduce((prev, obj) => {
      prev[obj._id.website] = obj.count
      return prev
    }, {})
  } catch (err) {
    if (err) {
      throw err
    }
  }
}
