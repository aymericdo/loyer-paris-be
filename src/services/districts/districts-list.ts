import { DistrictItem, GeojsonFile } from '@interfaces/shared'
import { AvailableCities } from '@services/city-config/cities'
import { getCityList, zones, label } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterFactory } from '@services/filters/district-filter/encadrement-district-filter-factory'

interface DistrictElem {
  label: string
  value: string
  groupBy: string | null
  displaySequence: number | string
}

export const DISPLAY_ZONE_FIELD = 'displayZone'
export const DISPLAY_CITY_FIELD = 'displayCity'
export const ZONE_PATH = `properties.${DISPLAY_ZONE_FIELD}`
export const CITY_PATH = `properties.${DISPLAY_CITY_FIELD}`

export class DistrictsList {
  currentDistrictFilter = null
  mainCity: AvailableMainCities
  city: AvailableCities
  district: string

  constructor(
    city: AvailableMainCities,
    options?: { specificCity?: AvailableCities, specificDistrict?: string },
  ) {
    this.mainCity = city
    this.city = options?.specificCity
    this.district = options?.specificDistrict
    this.currentDistrictFilter = new (new DistrictFilterFactory(this.mainCity).currentDistrictFilter())(
      { city: this.city, districtName: this.district },
    )
  }

  async currentGeodata(): Promise<GeojsonFile> {
    const features: DistrictItem[] = await this.currentDistrictFilter.getDistricts()

    return {
      type: 'FeatureCollection',
      features: features.map((data) => ({
        ...data,
        properties: {
          ...data.properties,
          [DISPLAY_ZONE_FIELD]: this.currentDistrictFilter.digZoneInProperties(data['properties']),
          [DISPLAY_CITY_FIELD]: this.currentDistrictFilter.digCityInProperties(data['properties']),
        },
      })) as DistrictItem[],
    }
  }

  async currentFeature(): Promise<DistrictItem> {
    return await this.currentDistrictFilter.getFirstDistrict()
  }

  async districtElemWithGroupBy(): Promise<DistrictElem[]> {
    return getCityList(this.mainCity, this.city)
      .reduce((prev, city: AvailableCities) => {
        let currentZones = zones(city)
        if (!currentZones) currentZones = zones(this.mainCity as AvailableCities)
        if (currentZones) {
          if (Array.isArray(currentZones)) {
            (currentZones as string[]).forEach((zone) => {
              const labelZone = `${label(city)} (${zone})`

              prev.push({
                value: zone,
                label: labelZone,
                displaySequence: labelZone,
                groupBy: null,
              })
            })
          } else {
            Object.keys(currentZones).forEach((arrondissement: string) => {
              currentZones[arrondissement].forEach((zone: string) => {
                prev.push({
                  value: zone,
                  label: zone,
                  displaySequence: arrondissement,
                  groupBy: this.currentDistrictFilter.buildGroupBy(arrondissement),
                })
              })
            })
          }
        }

        return prev
      }, [])
  }
}
