import mainCities from '@services/city-config/main-cities.json'

type CityData = {
  cityList: string[],
  label: string,
  coordinates?: number[],
  infoLink?: string,
  house?: boolean,
  fake?: boolean,
  builtYearRangeEnd?: number,
}

export type AvailableMainCities = keyof typeof mainCities
export const CITIES: { readonly [city in AvailableMainCities]: Readonly<CityData> } = mainCities
