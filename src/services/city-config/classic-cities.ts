import cities from '@services/city-config/classic-cities.json'

type CityData = {
  postalCodes: string[]
  inseeCode: string
  label: string
  zones: string[] | { [arrondissement: number]: string[] }
  arrondissement?: boolean
}

export type AvailableCities = keyof typeof cities
export const CITY_DETAILS: {
  readonly [city in AvailableCities]: Readonly<CityData>
} = cities
