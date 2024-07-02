import { DistrictItem, GeojsonFile } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities, cityList } from '@services/address/city'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { capitalizeFirstLetter } from '@services/helpers/capitalize'

interface DistrictElem {
  label: string
  value: string
  groupBy: string | null
  displaySequence: number | string
}

export const DISPLAY_ZONE_FIELD = 'displayZone'
export const DISTRICT_FIELD = `properties.${DISPLAY_ZONE_FIELD}`

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
        },
      })) as DistrictItem[],
    }
  }

  async currentFeature(): Promise<DistrictItem> {
    return await this.currentDistrictFilter.getFirstDistrict()
  }

  async districtElemWithGroupBy(): Promise<DistrictElem[]> {
    return Object.keys(cityList)
      .filter((city) => {
        if (this.city) {
          return this.city === city
        } else {
          return cityList[city].mainCity === this.mainCity
        }
      })
      .reduce((prev, city) => {
        const currentZones = cityList[city].zones
        if (currentZones) {
          if (Array.isArray(currentZones)) {
            (currentZones as string[]).forEach((zone) => {
              const labelZone = capitalizeFirstLetter(`${city} (${zone})`)

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
