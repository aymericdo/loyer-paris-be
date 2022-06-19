import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { EstEnsembleEncadrementItem } from '@interfaces/json-item-est-ensemble'
import { YearBuiltService } from '@services/helpers/year-built'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'
import { EstEnsembleDistrictService } from './est-ensemble-district'

export class EstEnsembleFilterRentService {
  infoToFilter: InfoToFilter = null

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  filter(): FilteredResult[] {
    // Extract possible range time from rangeRents (json-data/encadrements_est-ensemble.json)
    const rangeTime = ['avant 1946', '1971-1990', '1946-1970', 'apres 1990']

    const districtsMatched = new EstEnsembleDistrictService(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(
      rangeTime,
      this.infoToFilter.yearBuilt
    ).getRangeTimeDates()

    const rentList = this.rangeRentsEstEnsembleJson().filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched
            .map((district) => +district.properties.Zone)
            .includes(+rangeRent['zone'])
          : true) &&
        (timeDates?.length
          ? timeDates.includes(rangeRent['annee_de_construction'])
          : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 4
            ? +rangeRent['nombre_de_piece'] === +this.infoToFilter.roomCount
            : rangeRent['nombre_de_piece'] === '4 et plus'
          : true) &&
        (this.infoToFilter.hasFurniture != null
          ? this.infoToFilter.hasFurniture
            ? rangeRent['meuble']
            : !rangeRent['meuble']
          : true) &&
        (this.infoToFilter.isHouse != null
          ? this.infoToFilter.isHouse
            ? rangeRent['maison']
            : !rangeRent['maison']
          : true)
      )
    })

    return rentList
      .map((r) => ({
        maxPrice: +r['prix_max'].toString().replace(',', '.'),
        minPrice: +r['prix_min'].toString().replace(',', '.'),
        districtName: `Zone ${r['zone']}`,
        isFurnished: r['meuble'],
        roomCount: r['nombre_de_piece'],
        yearBuilt: r['annee_de_construction'],
        isHouse: r['maison'] ? 'Maison' : null,
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
  private rangeRentsEstEnsembleJson(): EstEnsembleEncadrementItem[] {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/encadrements_est-ensemble.json'),
        'utf8'
      )
    )
  }
}