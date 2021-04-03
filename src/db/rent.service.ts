import { Rent } from '@db/db'
import { DataBaseItem } from '@interfaces/database-item'

function getCity(city: string) {
  switch (city) {
    case 'paris':
      return 'paris'
    case 'lille':
      return ['lille', 'hellemmes', 'lomme']
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
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lt: dateRange[1],
    }
  }

  return await Rent.find(
    filter,
    { isLegal: 1, latitude: 1, longitude: 1, district: 1 },
    (
      err: Error,
      rents: {
        isLegal: boolean
        latitude: number
        longitude: number
        district: string
      }[]
    ) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getChloroplethMapData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; district: string }[]> {
  const filter = {
    latitude: { $exists: true },
    longitude: { $exists: true },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lt: dateRange[1],
    }
  }
  return await Rent.find(
    filter,
    { isLegal: 1, district: 1 },
    (
      err: Error,
      rents: {
        isLegal: boolean
        district: string
      }[]
    ) => {
      if (err) {
        throw err
      }
      return rents
    }
  ).lean()
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
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lt: dateRange[1],
    }
  }
  return await Rent.find(
    filter,
    {
      maxPrice: 1,
      postalCode: 1,
      priceExcludingCharges: 1,
    },
    (
      err: Error,
      rents: {
        maxPrice: number
        postalCode: string
        priceExcludingCharges: number
      }[]
    ) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getLegalVarData(
  city: string,
  districtList: string[],
  surfaceRange: number[],
  roomRange: number[],
  hasFurniture: boolean,
  dateRange: string[]
): Promise<
  {
    isLegal: Boolean
    createdAt: string
  }[]
> {
  const filter = {}

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (districtList?.length) {
    filter['district'] = districtList
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
    filter['createdAt'] = { $gte: dateRange[0], $lt: dateRange[1] }
  }

  return await Rent.find(
    filter,
    {
      createdAt: 1,
      isLegal: 1,
    },
    (
      err: Error,
      rents: {
        isLegal: Boolean
        createdAt: string
      }[]
    ) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
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
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lt: dateRange[1],
    }
  }
  return await Rent.find(
    filter,
    {
      createdAt: 1,
      maxPrice: 1,
      priceExcludingCharges: 1,
    },
    (
      err: Error,
      rents: {
        createdAt: string
        maxPrice: number
        priceExcludingCharges: number
      }[]
    ) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getLegalPerRenterData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; renter: string }[]> {
  const filter = {
    surface: { $lte: 100 },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lt: dateRange[1],
    }
  }
  return await Rent.find(
    filter,
    { isLegal: 1, renter: 1 },
    (err: Error, rents: { isLegal: boolean; renter: string }[]) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getLegalPerWebsiteData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; website: string }[]> {
  const filter = {
    surface: { $lte: 100 },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lt: dateRange[1],
    }
  }
  return await Rent.find(
    filter,
    { isLegal: 1, website: 1 },
    (err: Error, rents: { isLegal: boolean; website: string }[]) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getLegalPerSurfaceData(
  city: string,
  dateRange: string[]
): Promise<{ isLegal: boolean; surface: number }[]> {
  const filter = {
    surface: { $lte: 100 },
  }

  if (city !== 'all') {
    filter['city'] = getCity(city)
  }

  if (dateRange?.length) {
    filter['createdAt'] = {
      $gte: dateRange[0],
      $lt: dateRange[1],
    }
  }
  return await Rent.find(
    filter,
    { isLegal: 1, surface: 1 },
    (err: Error, rents: { isLegal: boolean; surface: number }[]) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getAdoptionData(): Promise<{ createdAt: string }[]> {
  return await Rent.find(
    {},
    { createdAt: 1 },
    (err: Error, rents: { createdAt: string }[]) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getWelcomeData(): Promise<
  { isLegal: boolean; surface: number }[]
> {
  return await Rent.find(
    {},
    { isLegal: 1, surface: 1 },
    (err: Error, rents: { isLegal: boolean; surface: number }[]) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

interface RelevantAdsData {
  id: string
  surface: number
  roomCount: number
  website: string
  createdAt: Date
  hasFurniture: boolean
  price: number
  district: string
}
export async function getRelevantAdsData(): Promise<RelevantAdsData[]> {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 7))

  return await Rent.find(
    { isLegal: true, createdAt: { $gte: minDate } },
    {
      id: 1,
      surface: 1,
      roomCount: 1,
      website: 1,
      createdAt: 1,
      hasFurniture: 1,
      price: 1,
      district: 1,
    },
    { sort: { createdAt: -1 } },
    (err: Error, rents: RelevantAdsData[]) => {
      if (err) {
        throw err
      }
      return rents
    }
  )
}

export async function getAdById(
  id: string,
  website: string
): Promise<DataBaseItem> {
  return await Rent.findOne(
    { id, website },
    (err: Error, rent: DataBaseItem) => {
      if (err) {
        throw err
      }
      return rent
    }
  )
}
