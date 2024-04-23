import { FilteredResult } from '@interfaces/ad'
import { BordeauxEncadrementItem } from '@interfaces/json-item-bordeaux'
import { AvailableMainCities } from '@services/address/city'
import { BordeauxDistrictFilter } from '@services/filters/district-filter/bordeaux-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'
import { YearBuiltService } from '@services/helpers/year-built'

export class FilterBordeaux extends EncadrementFilterParent {
  city: AvailableMainCities = 'bordeaux'
  rangeTime = ['avant 1946', '1946-1970', '1971-1990', 'apres 1990']

  async filter(): Promise<FilteredResult[]> {
    const districtsMatched = await new BordeauxDistrictFilter(
      this.infoToFilter.city,
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(this.rangeTime, this.universalRangeTime).getRangeTimeFromYearBuilt(this.infoToFilter.yearBuilt)

    const rentList = (this.rangeRentsJson() as BordeauxEncadrementItem[]).filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched.map((district) => +district.properties.Zone).includes(+rangeRent['zone'])
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
