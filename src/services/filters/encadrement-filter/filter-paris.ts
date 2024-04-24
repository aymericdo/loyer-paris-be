import { FilteredResult } from '@interfaces/ad'
import { ParisEncadrementItem, ParisQuartierItem } from '@interfaces/json-item-paris'
import { AvailableMainCities } from '@services/address/city'
import { ParisDistrictFilter } from '@services/filters/district-filter/paris-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'
import { YearBuiltService } from '@services/helpers/year-built'
import * as fs from 'fs'
import * as path from 'path'

const mappingQuartierZoneParisJson: ParisQuartierItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_paris_quartiers.json'), 'utf8'))

export class FilterParis extends EncadrementFilterParent {
  city: AvailableMainCities = 'paris'
  // Extract possible range time from rangeRents (json-data/encadrements_paris.json)
  rangeTime: string[] = ['Avant 1946', '1946-1970', '1971-1990', 'Après 1990']

  async filter(): Promise<FilteredResult[]> {
    const districtsMatched = await new ParisDistrictFilter(
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates, {
        city: this.infoToFilter.city,
        postalCode: this.infoToFilter.postalCode,
        districtName: this.infoToFilter.districtName,
      }
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(this.rangeTime, this.universalRangeTime).getRangeTimeFromYearBuilt(this.infoToFilter.yearBuilt)

    let currentYear = +new Date().getFullYear()

    if (new Date().getMonth() < 6) {
      currentYear -= 1
    }

    const zones: ParisQuartierItem[] = mappingQuartierZoneParisJson.filter((zoneRent) => {
      return districtsMatched?.length
        ? districtsMatched.map((district) => district.properties.c_qu).includes(zoneRent.id_quartier)
        : false
    })

    const rentList = (this.rangeRentsJson() as ParisEncadrementItem[]).filter((rangeRent) => {
      return (
        rangeRent.annee === currentYear &&
        (zones?.length ? zones.map((zoneRent) => zoneRent.id_zone).includes(rangeRent.id_zone) : true) &&
        (timeDates?.length ? timeDates.includes(rangeRent.epoque) : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 4
            ? +rangeRent.piece === +this.infoToFilter.roomCount
            : rangeRent.piece.toString() === '4 et plus'
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
        return this.rangeTime.indexOf(a.yearBuilt) - this.rangeTime.indexOf(b.yearBuilt)
      })
  }
}
