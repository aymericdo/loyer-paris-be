import { AvailableCities } from '@services/city-config/cities'
import { fakeCities, getCitiesFromMainCity, AvailableCityZones } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FUNNIEST_WEBSITES } from '@services/websites/website'

export function getClassicWebsiteFilter(): { website: { $nin: typeof FUNNIEST_WEBSITES } } {
  return { website: { $nin: FUNNIEST_WEBSITES } }
}

export function getWebsiteFilter(website?: string): { website: string | { $nin: typeof FUNNIEST_WEBSITES } } {
  if (website) return { website }

  return getClassicWebsiteFilter()
}

export function getMainCityFilter(mainCity: AvailableMainCities | 'all'): { city: { $in: AvailableCities[] } } | { city: { $nin: string[] } } | Record<string, never> {
  if (!mainCity || mainCity === 'all') return { city: { $nin: fakeCities } }

  const cities = getCitiesFromMainCity(mainCity)
  return { city: { '$in': cities } }
}

export function getCityFilter(city: AvailableCities | 'all'): { city: AvailableCities } | { city: { $nin: string[] } } | Record<string, never> {
  if (!city || city === 'all') return { city: { $nin: fakeCities } }

  return { city }
}

export function getDateRangeFilter(dateRange: [string, string]): { createdAt: { $gte: Date, $lte: Date } } | Record<string, never> {
  if (!dateRange?.length) return {}

  return {
    createdAt: {
      $gte: new Date(dateRange[0]),
      $lte: new Date(dateRange[1]),
    }
  }
}

export function getDistrictFilter(districtList: AvailableCityZones): { district: { $in: AvailableCityZones } } | Record<string, never> {
  if (!(districtList as AvailableCityZones & [])?.length) return {}

  return {
    district: {
      $in: districtList,
    }
  }
}

export function getFurnitureFilter(hasFurniture: boolean): { hasFurniture: boolean } | Record<string, never> {
  if (hasFurniture === null) return {}

  return { hasFurniture }
}

export function getHouseFilter(isHouse: boolean): { isHouse: boolean } | Record<string, never> {
  if (isHouse === null) return {}

  return { isHouse }
}

export function getSurfaceFilter(surfaceRange: [number, number]): { surface: { $gte: number, $lte: number } } | Record<string, never> {
  if (!surfaceRange?.length) return {}

  return {
    surface: {
      $gte: surfaceRange[0],
      $lte: surfaceRange[1],
    }
  }
}

export function getClassicSurfaceFilter(): { surface: { $gte: number, $lte: number } } | Record<string, never> {
  return getSurfaceFilter([9, 100])
}

export function getPriceFilter(priceRange: [number, number]): { price: { $gte: number, $lte: number } } | Record<string, never> {
  if (!priceRange?.length) return {}

  return {
    price: {
      $gte: priceRange[0],
      $lte: priceRange[1],
    }
  }
}

export function getClassicPriceFilter(): { price: { $gte: number, $lte: number } } | Record<string, never> {
  return getPriceFilter([0, 10000])
}

export function getRoomFilter(roomRange: [number, number]): { roomCount: { $gte: number, $lte: number } } | Record<string, never> {
  if (!roomRange?.length) return {}

  return {
    roomCount: {
      $gte: roomRange[0],
      $lte: roomRange[1],
    }
  }
}

export function getIsParticulierFilter(isParticulier: boolean): { renter: ('Particulier' | { $ne: 'Particulier', $exists: true }) } | Record<string, never> {
  if (isParticulier === null) return {}

  if (isParticulier) {
    return {
      renter: 'Particulier',
    }
  } else {
    return {
      renter: {
        $ne: 'Particulier',
        $exists: true
      }
    }
  }
}

export function getExceedingFilter(exceedingRange: [number, number]): {
  $expr: {
    $and: [{
      $lte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, number],
    }, {
      $gte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, number],
    }]
  },
} | Record<string, never> {
  if (!exceedingRange?.length) return {}

  return {
    $expr: {
      $and: [
        { $lte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, exceedingRange[1]] },
        { $gte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, exceedingRange[0]] },
      ],
    }
  }
}

export function getClassicFilter(): {
  price: { $gte: number, $lte: number },
  surface: { $gte: number, $lte: number },
  website: { $nin: typeof FUNNIEST_WEBSITES },
  } {
  return {
    ...getClassicPriceFilter(),
    ...getClassicSurfaceFilter(),
    ...getClassicWebsiteFilter(),
  } as {
    price: { $gte: number, $lte: number },
    surface: { $gte: number, $lte: number },
    website: { $nin: typeof FUNNIEST_WEBSITES },
  }
}