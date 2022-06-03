import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { PlaineCommuneEncadrementItem } from '@interfaces/json-item-plaine-commune'
import { YearBuiltService } from '@services/year-built'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'
import { PlaineCommuneDistrictService } from './plaine-commune-district'

export class PlaineCommuneFilterRentService {
  infoToFilter: InfoToFilter = null

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  filter(): FilteredResult[] {
    // Extract possible range time from rangeRents (json-data/encadrements_plaine-commune.json)
    const rangeTime = ['avant 1946', '1971-1990', '1946-1970', 'après 1990']

    const districtsMatched = new PlaineCommuneDistrictService(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(
      rangeTime,
      this.infoToFilter.yearBuilt
    ).getRangeTimeDates()

    const rentList = this.rangeRentsPlaineCommuneJson().filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched
            .map((district) => district.properties.Zone)
            .includes(rangeRent['zone'].toString())
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
  private rangeRentsPlaineCommuneJson(): PlaineCommuneEncadrementItem[] {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/encadrements_plaine-commune.json'),
        'utf8'
      )
    )
  }
}
