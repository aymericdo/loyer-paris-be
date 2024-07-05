import { Rent } from '@db/db'
import { getCityFilter, getClassicWebsiteFilter, getDateRangeFilter, getDistrictFilter, getFurnitureFilter, getIsParticulierFilter, getRoomFilter, getSurfaceFilter } from '@services/db/queries/common'
import { AvailableCityZones, AvailableMainCities } from '@services/filters/city-filter/city-list'

export async function getLegalPerDate(
  city: AvailableMainCities,
  districtList: AvailableCityZones,
  surfaceRange: [number, number],
  roomRange: [number, number],
  hasFurniture: boolean,
  dateRange: [string, string],
  isParticulier: boolean | null
): Promise<
  {
    isLegal: boolean
    createdAt: string
  }[]
> {
  const filter = {
    ...getClassicWebsiteFilter(),
    ...getCityFilter(city),
    ...getDateRangeFilter(dateRange),
    ...getDistrictFilter(districtList),
    ...getFurnitureFilter(hasFurniture),
    ...getSurfaceFilter(surfaceRange),
    ...getRoomFilter(roomRange),
    ...getIsParticulierFilter(isParticulier),
  }

  return (await Rent.find(filter, {
    createdAt: 1,
    isLegal: 1,
  }))
}