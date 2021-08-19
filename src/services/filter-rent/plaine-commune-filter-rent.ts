import * as fs from 'fs'
import * as path from 'path'
import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { YearBuiltService } from '@services/year-built'
import { PlaineCommuneEncadrementItem } from '@interfaces/json-item-plaine-commune'
import { Memoize } from 'typescript-memoize'
import { PlaineCommuneDistrictService } from './plaine-commune-district'

export class PlaineCommuneFilterRentService {
  infoToFilter: InfoToFilter = null

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  filter(): FilteredResult {
    // Extract possible range time from rangeRents (json-data/encadrements_plaine_commune.csv)
    const rangeTime = ['avant 1946', '1971-1990', '1946-1970', 'après 1990']

    const districtsMatched = new PlaineCommuneDistrictService(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates
    ).getDistricts()

    const timeDates: string[] = YearBuiltService.getRangeTimeDates(
      rangeTime,
      this.infoToFilter.yearBuilt
    )

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

    // Get the worst case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) =>
          +prev['Loyer de référence majoré'].replace(',', '.') >
          +current['Loyer de référence majoré'].replace(',', '.')
            ? prev
            : current
        )
      : null

    return {
      maxPrice: +worstCase['Loyer de référence majoré'].replace(',', '.'),
      minPrice: +worstCase['Loyer de référence minoré'].replace(',', '.'),
      districtName: `Zone ${worstCase['Secteur géographique']}`,
      isFurnished: !!worstCase['Type de location'].match(/^meubl/g),
      roomCount: +worstCase['Nombre de pièces'],
      yearBuilt: worstCase['Epoque de construction'],
      isHouse: worstCase.Type === 'Maison' ? worstCase.Type : null,
    }
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
