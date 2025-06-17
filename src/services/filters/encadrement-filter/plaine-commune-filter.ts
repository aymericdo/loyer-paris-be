import { ZoneDocument } from '@db/zone.model'
import { PlaineCommuneDistrictItemProperties } from '@interfaces/plaine-commune'
import { DefaultEncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FilterParent } from '@services/filters/encadrement-filter/filter-parent'

export class PlaineCommuneFilter extends FilterParent {
  mainCity: AvailableMainCities = 'plaineCommune'
  criteriaJsonPath = 'json-data/encadrements_plaine-commune_2024.json'

  protected async isDistrictMatch(districtsMatched: ZoneDocument[], rangeRent: DefaultEncadrementItem): Promise<boolean> {
    return districtsMatched?.length
      ? districtsMatched.map((district) => +(district.properties as PlaineCommuneDistrictItemProperties).Zone)
        .includes(+(rangeRent as DefaultEncadrementItem).zone)
      : false
  }
}
