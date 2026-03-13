import mainCities from '@services/city-config/main-cities.json'

export interface RentControlPeriod {
  start?: string
  end?: string
  file: string
}

type CityData = {
  cityList: string[]
  label: string
  coordinates?: number[]
  infoLink?: string
  house?: boolean
  fake?: boolean
  builtYearRangeEnd?: number
  rentControlPeriods?: RentControlPeriod[]
}

export type AvailableMainCities = keyof typeof mainCities
export const CITIES: {
  readonly [city in AvailableMainCities]: Readonly<CityData>
} = mainCities
