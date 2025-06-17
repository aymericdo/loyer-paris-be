import { ZoneDocument, ZoneProperties } from '@db/zone.model'
import { EncadrementItem, DefaultEncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FilterParent } from '@services/filters/encadrement-filter/filter-parent'

export class GrenobleFilter extends FilterParent {
  mainCity: AvailableMainCities = 'grenoble'
  criteriaJsonPath = 'json-data/encadrements_grenoble.json'

  protected async isDistrictMatch(districtsMatched: ZoneDocument[], rangeRent: EncadrementItem): Promise<boolean> {
    // Need to customize Grenoble because for some reasons, Zone can be A (yea I know.)
    return districtsMatched?.length
      ? districtsMatched.map((district: ZoneDocument) =>
        /^\d+$/.test((district.properties as ZoneProperties).zone) ?
          +(district.properties as ZoneProperties).zone :
          (district.properties as ZoneProperties).zone
      ).includes((rangeRent as DefaultEncadrementItem).zone)
      : false
  }
}
