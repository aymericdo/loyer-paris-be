import { PlaineCommuneDistrictItem } from '@interfaces/plaine-commune'
import { DistrictItem, EncadrementItem, DefaultEncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterPlaineCommune } from '@services/filters/district-filter/district-filter-plaine-commune'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterPlaineCommune extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterPlaineCommune
  mainCity: AvailableMainCities = 'plaineCommune'
  rangeRentsJsonPath = 'json-data/encadrements_plaine-commune_2024.json'

  protected async isDistrictMatch(districtsMatched: DistrictItem[], rangeRent: EncadrementItem): Promise<boolean> {
    return districtsMatched?.length
      ? districtsMatched.map((district: PlaineCommuneDistrictItem) => +district.properties.Zone)
        .includes(+(rangeRent as DefaultEncadrementItem).zone)
      : false
  }
}
