import { FilteredResult } from '@interfaces/ad'
import { AvailableMainCities } from '@services/address/city'
import { YearBuiltService } from '@services/helpers/year-built'
import { EncadrementFilterParent } from './encadrement-filter-parent'
import { LilleDistrictService } from '../lille-district'
import { LilleEncadrementItem } from '@interfaces/json-item-lille'

export class FilterLille extends EncadrementFilterParent {
  city: AvailableMainCities = 'lille'

  filter(): FilteredResult[] {
    // Extract possible range time from rangeRents (json-data/encadrements_lille.json)
    const rangeTime = ['< 1946', '1971 - 1990', '1946 - 1970', '> 1990']

    const districtsMatched = new LilleDistrictService(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(
      rangeTime,
      this.infoToFilter.yearBuilt
    ).getRangeTimeDates()

    const rentList = (this.rangeRentsJson() as LilleEncadrementItem[]).filter((rangeRent) => {
      return (
        (districtsMatched?.length
          ? districtsMatched
            .map((district) => district.properties.zonage)
            .includes(rangeRent.fields.zone)
          : true) &&
        (timeDates?.length
          ? timeDates.includes(rangeRent.fields.epoque_construction)
          : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 4
            ? +rangeRent.fields.nb_pieces === +this.infoToFilter.roomCount
            : rangeRent.fields.nb_pieces === '4 et +'
          : true)
      )
    })

    const isFurnished =
      this.infoToFilter.hasFurniture === null
        ? true
        : this.infoToFilter.hasFurniture

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
        return rangeTime.indexOf(a.yearBuilt) - rangeTime.indexOf(b.yearBuilt)
      })
  }
}
