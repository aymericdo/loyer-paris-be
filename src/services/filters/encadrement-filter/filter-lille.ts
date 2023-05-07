import { FilteredResult } from '@interfaces/ad'
import { LilleEncadrementItem } from '@interfaces/json-item-lille'
import { AvailableMainCities } from '@services/address/city'
import { LilleDistrictFilter } from '@services/filters/district-filter/lille-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'
import { YearBuiltService } from '@services/helpers/year-built'

export class FilterLille extends EncadrementFilterParent {
  city: AvailableMainCities = 'lille'
  // Extract possible range time from rangeRents (json-data/encadrements_lille.json)
  rangeTime = ['< 1946', '1946 - 1970', '1971 - 1990', '> 1990']

  filter(): FilteredResult[] {
    const districtsMatched = new LilleDistrictFilter(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(this.rangeTime, this.infoToFilter.yearBuilt).getRangeTimeDates()

    const rentList = (this.rangeRentsJson() as LilleEncadrementItem[]).filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched.map((district) => district.properties.zonage).includes(rangeRent.fields.zone)
          : true) &&
        (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque_construction) : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 4
            ? +rangeRent.fields.nb_pieces === +this.infoToFilter.roomCount
            : rangeRent.fields.nb_pieces === '4 et +'
          : true)
      )
    })

    const isFurnished = this.infoToFilter.hasFurniture === null ? true : this.infoToFilter.hasFurniture

    return rentList
      .map((r) => ({
        maxPrice: isFurnished
          ? +r.fields.loyer_de_reference_majore_meublees
          : +r.fields.loyer_de_reference_majore_non_meublees,
        minPrice: isFurnished
          ? +r.fields.loyer_de_reference_minore_meublees
          : +r.fields.loyer_de_reference_minore_non_meublees,
        districtName: `Zone ${r.fields.zone}`,
        isFurnished,
        roomCount: r.fields.nb_pieces,
        yearBuilt: r.fields.epoque_construction,
      }))
      .sort((a, b) => {
        return this.rangeTime.indexOf(a.yearBuilt) - this.rangeTime.indexOf(b.yearBuilt)
      })
  }
}
