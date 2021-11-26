import { Rent } from '@db/db'
import { DataBaseItem } from '@interfaces/database-item'

function getCity(city: string) {
  switch (city) {
    case 'paris':
      return { $in: ['paris'] }
    case 'lille':
      return { $in: ['lille', 'hellemmes', 'lomme'] }
    case 'plaine_commune':
      return {
        $in: [
          'aubervilliers',
          'epinay-sur-seine',
          'ile-saint-denis',
          'courneuve',
          'pierrefitte',
          'saint-denis',
          'saint-ouen',
          'stains',
          'villetaneuse',
        ],
      }
    case 'lyon':
      return { $in: ['lyon', 'villeurbanne'] }
  }
}

export async function getMapData(
  city: string,
  dateRange: string[]
): Promise<
  { isLegal: boolean; latitude: number; longitude: number; district: string }[]
> {
  const filter = {
    latitude: { $exists: true },
    longitude: { $exists: true },
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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
): Promise<
  { maxPrice: number; postalCode: string; priceExcludingCharges: number }[]
> {
  const filter = {
    postalCode: { $exists: true },
    isLegal: false,
    priceExcludingCharges: { $lte: 10000 },
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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
    filter['website'] = { $nin: ['bellesdemeures', 'luxresidence'] }
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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

export async function getLegalPerWebsiteData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; website: string }[]> {
  const filter = {
    surface: { $lte: 100 },
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lte: dateRange[1],
    }
  }
  try {
    return (await Rent.find(filter, { isLegal: 1, website: 1 }).lean()) as unknown as {
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
    website: { $nin: ['bellesdemeures', 'luxresidence'] },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
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

export async function getWelcomeData(): Promise<
  { isLegal: boolean; surface: number }[]
  > {
  try {
    return (await Rent.find({}, { isLegal: 1, surface: 1 })) as unknown as {
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
  url: string
  district: string
  city: string
  isHouse: boolean
}
export async function getRelevantAdsData(
  filterParam: {
    city: string
    districtList: string[]
    surfaceRange: number[]
    priceRange: number[]
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

  try {
    return (await Rent.find(
      filter,
      {
        id: 1,
        surface: 1,
        roomCount: 1,
        website: 1,
        createdAt: 1,
        hasFurniture: 1,
        price: 1,
        district: 1,
        url: 1,
        city: 1,
        isHouse: 1,
      },
      {
        sort: { createdAt: -1 },
        skip: page * perPage,
        limit: perPage,
      }
    )) as unknown as RelevantAdsData[]
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
  roomRange: number[]
  hasFurniture: boolean
  isHouse: boolean
  isLegal: boolean
}) {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 7))

  const filter = { isLegal: filterParam.isLegal, createdAt: { $gte: minDate } }

  if (filterParam.city !== 'all') {
    filter['city'] = getCity(filterParam.city)
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

  return filter
}

export async function getAdById(
  id: string,
  website: string
): Promise<DataBaseItem> {
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
  maxDelta = 200,
): Promise<{
  url: string
  website: string
  priceExcludingCharges: number
  maxPrice: number
}[]> {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 7))

  const filter = {
    isLegal: false,
    createdAt: { $gte: minDate },
    city: getCity(city),
    $expr: { $gte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, maxDelta] }
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
