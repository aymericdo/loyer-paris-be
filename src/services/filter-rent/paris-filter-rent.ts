import * as fs from 'fs'
import * as path from 'path'
import { ParisEncadrementItem, ParisQuartierItem } from '@interfaces/json-item-paris'
import { FilteredResult } from '@interfaces/ad'
import { YearBuiltService } from '@services/year-built'
import { ParisDistrictService } from '@services/filter-rent/paris-district'
import { Memoize } from 'typescript-memoize'
import { InfoToFilter } from '../../interfaces/ad'

export class ParisFilterRentService {
  infoToFilter: InfoToFilter = null

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  filter(): FilteredResult[] {
    // Extract possible range time from rangeRents (json-data/encadrements_paris.json)
    const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Après 1990']

    const districtsMatched = new ParisDistrictService(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(
      rangeTime,
      this.infoToFilter.yearBuilt
    ).getRangeTimeDates()

    let currentYear = +new Date().getFullYear()

    if (new Date().getMonth() < 6) {
      currentYear -= 1
    }

    const zones: ParisQuartierItem[] = this.mappingQuartierZoneParisJson().filter((zoneRent) => {
      return (districtsMatched?.length
        ? districtsMatched
          .map((district) => district.properties.c_qu)
          .includes(zoneRent.id_quartier)
        : [])
    })

    const rentList = this.rangeRentsParisJson().filter((rangeRent) => {
      return (
        currentYear === rangeRent.annee &&
        (zones?.length
          ? zones
            .map((zoneRent) => zoneRent.id_zone)
            .includes(rangeRent.id_zone)
          : true) &&
        (timeDates?.length
          ? timeDates.includes(rangeRent.epoque)
          : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 5
            ? +rangeRent.piece === +this.infoToFilter.roomCount
            : +rangeRent.piece === 4
          : true) &&
        (this.infoToFilter.hasFurniture != null
          ? this.infoToFilter.hasFurniture
            ? rangeRent.meuble_txt.match(/^meubl/g)
            : rangeRent.meuble_txt.match(/^non meubl/g)
          : true)
      )
    })

    return rentList
      .map((r) => ({
        maxPrice: +r.max,
        minPrice: +r.min,
        districtName: zones.find((zone) => zone.id_zone === r.id_zone).nom_quartier,
        isFurnished: !!r.meuble_txt.match(/^meubl/g),
        roomCount: r.piece.toString(),
        yearBuilt: r.epoque,
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
  private rangeRentsParisJson(): ParisEncadrementItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/encadrements_paris.json'), 'utf8')
    )
  }

  @Memoize()
  private mappingQuartierZoneParisJson(): ParisQuartierItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/encadrements_paris_quartiers.json'), 'utf8')
    )
  }
}
