import { Rent } from '@db/db'
import { DataBaseItem } from '@interfaces/database-item'

export async function getMapData(
  city: string
): Promise<
  { isLegal: boolean; latitude: number; longitude: number; district: string }[]
> {
  return await Rent.find(
    { latitude: { $exists: true }, longitude: { $exists: true }, city },
    { isLegal: 1, latitude: 1, longitude: 1, city: 1, district: 1 },
    (
      err: Error,
      rents: {
        isLegal: boolean
        latitude: number
        longitude: number
        city: string
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
  city: string
): Promise<{ isLegal: boolean; district: string }[]> {
  return await Rent.find(
    {
      latitude: { $exists: true },
      longitude: { $exists: true },
      city,
    },
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
  city: string
): Promise<
  { maxPrice: number; postalCode: string; priceExcludingCharges: number }[]
> {
  return await Rent.find(
    { postalCode: { $exists: true }, city, isLegal: false },
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
  hasFurniture: boolean
): Promise<
  {
    isLegal: Boolean
    createdAt: string
  }[]
> {
  const request = { createdAt: { $exists: true }, city }

  if (districtList?.length) {
    request['district'] = districtList
  }

  if (hasFurniture !== null) {
    request['hasFurniture'] = hasFurniture
  }

  if (surfaceRange?.length) {
    request['surface'] = { $gte: surfaceRange[0], $lte: surfaceRange[1] }
  }

  if (roomRange?.length) {
    request['roomCount'] = { $gte: roomRange[0], $lte: roomRange[1] }
  }

  return await Rent.find(
    request,
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
  city: string
): Promise<
  {
    maxPrice: number
    createdAt: string
    priceExcludingCharges: number
  }[]
> {
  return await Rent.find(
    { createdAt: { $exists: true }, city, isLegal: false },
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
  city: string
): Promise<{ isLegal: boolean; renter: string }[]> {
  return await Rent.find(
    { surface: { $lte: 100 }, city },
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
  city: string
): Promise<{ isLegal: boolean; website: string }[]> {
  return await Rent.find(
    { surface: { $lte: 100 }, city },
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
  city: string
): Promise<{ isLegal: boolean; surface: number }[]> {
  return await Rent.find(
    { surface: { $lte: 100 }, city },
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
export function getLegalPerWebsite(city: string) {
  throw new Error('Function not implemented.')
}
