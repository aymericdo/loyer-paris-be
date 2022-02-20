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
            .includes(rangeRent['Secteur géographique'].toString())
          : true) &&
        (timeDates?.length
          ? timeDates.includes(rangeRent['Epoque de construction'])
          : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 4
            ? +rangeRent['Nombre de pièces'] === +this.infoToFilter.roomCount
            : rangeRent['Nombre de pièces'] === '4 et plus'
          : true) &&
        (this.infoToFilter.hasFurniture != null
          ? this.infoToFilter.hasFurniture
            ? rangeRent['Type de location'].match(/^meubl/g)
            : rangeRent['Type de location'].match(/^non meubl/g)
          : true) &&
        (this.infoToFilter.isHouse != null
          ? this.infoToFilter.isHouse
            ? rangeRent.Type === 'Maison'
            : rangeRent.Type === 'Appartement'
          : true)
      )
    })

    return rentList
      .map((r) => ({
        maxPrice: +r['Loyer de référence majoré'].replace(',', '.'),
        minPrice: +r['Loyer de référence minoré'].replace(',', '.'),
        districtName: `Zone ${r['Secteur géographique']}`,
        isFurnished: !!r['Type de location'].match(/^meubl/g),
        roomCount: r['Nombre de pièces'],
        yearBuilt: r['Epoque de construction'],
        isHouse: r.Type === 'Maison' ? 'Maison' : null,
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
