import { FilteredResult } from '@interfaces/ad'
import { EstEnsembleEncadrementItem } from '@interfaces/json-item-est-ensemble'
import { AvailableMainCities } from '@services/address/city'
import { EstEnsembleDistrictFilter } from '@services/filters/district-filter/est-ensemble-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'
import { YearBuiltService } from '@services/helpers/year-built'

export class FilterEstEnsemble extends EncadrementFilterParent {
  city: AvailableMainCities = 'estEnsemble'

  async filter(): Promise<FilteredResult[]> {
    const districtsMatched = await new EstEnsembleDistrictFilter({
      coordinates: this.infoToFilter.coordinates,
      blurryCoordinates: this.infoToFilter.blurryCoordinates,
      city: this.infoToFilter.city,
      postalCode: this.infoToFilter.postalCode,
      districtName: this.infoToFilter.districtName,
    }).getDistricts()

    const timeDates: string[] = new YearBuiltService(this.rangeTime, this.universalRangeTime).getRangeTimeFromYearBuilt(this.infoToFilter.yearBuilt)

    const rentList = (this.rangeRentsJson() as EstEnsembleEncadrementItem[]).filter((rangeRent) => {
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
