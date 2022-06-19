import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { LilleEncadrementItem } from '@interfaces/json-item-lille'
import { YearBuiltService } from '@services/helpers/year-built'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'
import { LilleDistrictService } from './lille-district'

export class LilleFilterRentService {
  infoToFilter: InfoToFilter = null

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  filter(): FilteredResult[] {
    // Extract possible range time from rangeRents (json-data/encadrements_lille.json)
    const rangeTime = ['< 1946', '1971 - 1990', '1946 - 1970', '> 1990']

    const districtsMatched = new LilleDistrictService(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(
      rangeTime,
      this.infoToFilter.yearBuilt
    ).getRangeTimeDates()

    const rentList = this.rangeRentsLilleJson().filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched
            .map((district) => district.properties.zonage)
            .includes(rangeRent.fields.zone)
          : true) &&
        (timeDates?.length
          ? timeDates.includes(rangeRent.fields.epoque_construction)
          : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 4
            ? +rangeRent.fields.nb_pieces === +this.infoToFilter.roomCount
            : rangeRent.fields.nb_pieces === '4 et +'
          : true)
      )
    })

    const isFurnished =
      this.infoToFilter.hasFurniture === null
        ? true
        : this.infoToFilter.hasFurniture

    return rentList
      .map((r) => ({
        maxPrice: isFurnished
          ? +r.fields.loyer_de_reference_majore_meublees
          : +r.fields.loyer_de_reference_majore_non_meublees,
        minPrice: isFurnished
          ? +r.fields.loyer_de_reference_minore_meublees
          : +r.fields.loyer_de_reference_minore_non_meublees,
        districtName: `Zone ${r.fields.zone}`,
        isFurnished,
        roomCount: r.fields.nb_pieces,
        yearBuilt: r.fields.epoque_construction,
      }))
      .sort((a, b) => {
        return rangeTime.indexOf(a.yearBuilt) - rangeTime.indexOf(b.yearBuilt)
      })
  }

  find(): FilteredResult {
    const rentList = this.filter()

    // Get the worst case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) =>
        prev.maxPrice > current.maxPrice ? prev : current
      )
      : null

    return worstCase
  }

  @Memoize()
  private rangeRentsLilleJson(): LilleEncadrementItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/encadrements_lille.json'), 'utf8')
    )
  }
}