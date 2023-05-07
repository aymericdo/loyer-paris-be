import { FilteredResult } from '@interfaces/ad'
import { PlaineCommuneEncadrementItem } from '@interfaces/json-item-plaine-commune'
import { AvailableMainCities } from '@services/address/city'
import { PlaineCommuneDistrictFilter } from '@services/filters/district-filter/plaine-commune-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'
import { YearBuiltService } from '@services/helpers/year-built'

export class FilterPlaineCommune extends EncadrementFilterParent {
  city: AvailableMainCities = 'plaineCommune'
  // Extract possible range time from rangeRents (json-data/encadrements_plaine-commune.json)
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', 'apres 1990']

  filter(): FilteredResult[] {
    const districtsMatched = new PlaineCommuneDistrictFilter(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(this.rangeTime, this.universalRangeTime).getRangeTimeFromYearBuilt(this.infoToFilter.yearBuilt)

    const rentList = (this.rangeRentsJson() as PlaineCommuneEncadrementItem[]).filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched.map((district) => district.properties.Zone).includes(rangeRent['zone'].toString())
          : true) &&
        (timeDates?.length ? timeDates.includes(rangeRent['annee_de_construction']) : true) &&
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
        return this.rangeTime.indexOf(a.yearBuilt) - this.rangeTime.indexOf(b.yearBuilt)
      })
  }
}
