import { DistrictItem, GeojsonFile } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities, getCityList, getCityZones } from '@services/filters/city-filter/city-list'
import { DistrictFilterFactory } from '@services/filters/district-filter/encadrement-district-filter-factory'
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
    return getCityList(this.mainCity, this.city)
      .reduce((prev, city: AvailableCities) => {
        const currentZones = getCityZones(city)
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
