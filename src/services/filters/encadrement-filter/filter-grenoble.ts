import { DistrictItem, EncadrementItem, DefaultDistrictItem, DefaultEncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterGrenoble } from '@services/filters/district-filter/district-filter-grenoble'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterGrenoble extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterGrenoble
  mainCity: AvailableMainCities = 'grenoble'
  rangeRentsJsonPath = 'json-data/encadrements_grenoble.json'

  protected async isDistrictMatch(districtsMatched: DistrictItem[], rangeRent: EncadrementItem): Promise<boolean> {
    return districtsMatched?.length
      ? districtsMatched.map((district: DefaultDistrictItem) =>
        /^\d+$/.test(district.properties.zone) ?
          +district.properties.zone :
          district.properties.zone
      ).includes((rangeRent as DefaultEncadrementItem).zone)
      : false
  }
}
