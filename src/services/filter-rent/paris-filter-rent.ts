import * as fs from 'fs'
import * as path from 'path'
import { ParisEncadrementItem } from '@interfaces/json-item-paris'
import { CleanAd, FilteredResult } from '@interfaces/ad'
import { YearBuiltService } from '@services/year-built'
import { ParisDistrictService } from '@services/filter-rent/paris-district'
import { Memoize } from 'typescript-memoize'

export class ParisFilterRentService {
  cleanAd: CleanAd = null

  constructor(cleanAd: CleanAd) {
    this.cleanAd = cleanAd
  }

  filter(): FilteredResult {
    // Extract possible range time from rangeRents (json-data/encadrements_paris.json)
    const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

    const districtsMatched = new ParisDistrictService(
      this.cleanAd.postalCode,
      this.cleanAd.coordinates || this.cleanAd.blurryCoordinates
    ).getDistricts()

    const timeDates: string[] = YearBuiltService.getRangeTimeDates(
      rangeTime,
      this.cleanAd.yearBuilt
    )

    const rentList = this.rangeRentsParisJson().filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched
              .map((district) => district.properties.c_qu)
              .includes(rangeRent.fields.id_quartier)
          : true) &&
        (timeDates?.length
          ? timeDates.includes(rangeRent.fields.epoque)
          : true) &&
        (this.cleanAd.roomCount
          ? +this.cleanAd.roomCount < 5
            ? rangeRent.fields.piece === +this.cleanAd.roomCount
            : rangeRent.fields.piece === 4
          : true) &&
        (this.cleanAd.hasFurniture != null
          ? this.cleanAd.hasFurniture
            ? rangeRent.fields.meuble_txt.match(/^meubl/g)
            : rangeRent.fields.meuble_txt.match(/^non meubl/g)
          : true)
      )
    })

    // Get the worst case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) =>
          prev.fields.max > current.fields.max ? prev : current
        )
      : null

    return {
      maxPrice: +worstCase.fields.max,
      minPrice: +worstCase.fields.min,
      districtName: worstCase.fields.nom_quartier,
      isFurnished: !!worstCase.fields.meuble_txt.match(/^meubl/g),
      roomCount: +worstCase.fields.piece,
      yearBuilt: worstCase.fields.epoque,
    }
  }

  @Memoize()
  private rangeRentsParisJson(): ParisEncadrementItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/encadrements_paris.json'), 'utf8')
    )
  }
}
