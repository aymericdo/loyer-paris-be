import { AvailableCities, CITY_DETAILS } from '@services/city-config/cities'
import { AvailableMainCities, CITIES } from '@services/city-config/main-cities'
import { DATE_RANGE_END_IN_1990, DATE_RANGE_END_IN_2005, DateRange } from '@services/helpers/year-built'

export type AvailableCityZones = string[] | { [key: string]: string[] }

export function getMainCityList(): AvailableMainCities[] {
  return Object.keys(CITIES) as AvailableMainCities[]
}

export function getCities(): AvailableCities[] {
  return getMainCityList().reduce((prev, mainCity) => {
    prev = prev.concat(CITIES[mainCity].cityList)
    return prev
  }, [])
}

export const getCityList = (mainCity: AvailableMainCities | null = null, city: AvailableCities | null = null): AvailableCities[] =>
  city ? [city] : mainCity ? getCitiesFromMainCity(mainCity) : [...getCities()]
export const getMainCity = (city: AvailableCities): AvailableMainCities => getMainCityList().find((mainCity) => getCitiesFromMainCity(mainCity).includes(city))
export const getCitiesFromMainCity = (mainCity: AvailableMainCities): AvailableCities[] => [...CITIES[mainCity].cityList] as AvailableCities[]

export const canHaveHouse = (mainCity: AvailableMainCities): boolean => {
  // https://www.youtube.com/watch?v=TuxMwALL_S4&ab_channel=Charted
  return CITIES[mainCity]?.house ?? false
}

export const isFake = (mainCity: AvailableMainCities): boolean => {
  return CITIES[mainCity]?.fake ?? false
}

export const getFakeCities = () => getMainCityList().filter((mainCity) => isFake(mainCity))

export const infoLink = (mainCity: AvailableMainCities): string => {
  return CITIES[mainCity]?.infoLink ?? null
}

export const dateBuiltRange = (mainCity: AvailableMainCities): DateRange[] => {
  return CITIES[mainCity]?.builtYearRangeEnd === 2005 ? DATE_RANGE_END_IN_2005 : DATE_RANGE_END_IN_1990
}

export const coordinates = (mainCity: AvailableMainCities): [number, number] => {
  return CITIES[mainCity]?.coordinates as [number, number] ?? [46.2513662, 4.755835] as [number, number]
}

export const label = (city: AvailableMainCities | AvailableCities): string => {
  return CITY_DETAILS[city]?.label ?? CITIES[city].label ?? null
}

export const inseeCode = (city: AvailableCities): string => {
  return CITY_DETAILS[city]?.inseeCode ?? null
}

export const hasArrondissement = (city: AvailableCities): boolean => {
  return CITY_DETAILS[city]?.arrondissement ?? false
}

export const postalCodes = (city: AvailableCities): string[] => {
  return CITY_DETAILS[city]?.postalCodes
}

export const zones = (city: AvailableCities) => {
  return CITY_DETAILS[city]?.zones
}
