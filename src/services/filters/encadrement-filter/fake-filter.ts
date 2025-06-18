import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { ObservatoireEncadrementItem } from '@interfaces/observatoire-des-loyers'
import { canHaveHouse } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FilterParent } from '@services/filters/encadrement-filter/filter-parent'

export class FakeFilter extends FilterParent {
  rangeTime: string[] = [
    'avant 1946',
    '1946-1970',
    '1971-1990',
    '1991-2005',
    'apres 2005',
  ]

  constructor(
    mainCity: AvailableMainCities,
    criteriaJsonPath: string,
    infoToFilter: InfoToFilter,
  ) {
    super(infoToFilter)
    this.mainCity = mainCity
    this.criteriaJsonPath = criteriaJsonPath
  }

  async find(): Promise<FilteredResult> {
    const rentList = await this.filter()
    if (!rentList.length) return null

    const getScore = (item: FilteredResult): number => {
      const hasPieces = item.roomCount !== ''
      const hasEpoque = item.yearBuilt !== ''
      if (hasPieces && hasEpoque) return 3
      if (hasPieces || hasEpoque) return 2
      return 1
    }

    // On trouve la meilleure note présente dans la liste
    const maxScore = Math.max(...rentList.map(getScore))

    // On filtre tous les éléments qui ont ce score max
    const bestCandidates = rentList.filter(
      (item) => getScore(item) === maxScore,
    )

    // On prend celui qui a le plus grand maxPrice parmi eux
    const best = bestCandidates.reduce((prev, curr) =>
      curr.maxPrice > prev.maxPrice ? curr : prev,
    )

    return best
  }

  protected async isRoomCountMatch(
    rent: ObservatoireEncadrementItem,
  ): Promise<boolean> {
    if (!rent.nombre_pieces_homogene.length) return true

    const roomCount = this.normalizedRoomCount(rent.nombre_pieces_homogene)

    return this.infoToFilter.roomCount
      ? +this.infoToFilter.roomCount < 4
        ? roomCount === +this.infoToFilter.roomCount
        : roomCount === '4 et plus'
      : true
  }

  protected async isYearBuiltMatch(
    rangeRent: ObservatoireEncadrementItem,
  ): Promise<boolean> {
    if (!rangeRent.epoque_construction_homogene.length) return true

    const dateRange = this.dateRangeMatched()
    return dateRange?.length
      ? dateRange.includes(rangeRent.epoque_construction_homogene)
      : true
  }

  async isHasFurnitureMatch(
    _rangeRent: ObservatoireEncadrementItem,
  ): Promise<boolean> {
    return true
  }

  protected async isHasHouseMatch(
    rangeRent: ObservatoireEncadrementItem,
  ): Promise<boolean> {
    if (!canHaveHouse(this.mainCity)) return true
    if (!rangeRent.Type_habitat.length) return true

    return this.infoToFilter.isHouse != null
      ? this.infoToFilter.isHouse
        ? rangeRent.Type_habitat === 'Maison'
        : rangeRent.Type_habitat === 'Appartement'
      : true
  }

  protected async mappingResult(
    rentList: ObservatoireEncadrementItem[],
  ): Promise<FilteredResult[]> {
    return rentList
      .map((rent: ObservatoireEncadrementItem) => {
        const res = {
          maxPrice: +rent.loyer_median_max,
          minPrice: +rent.loyer_median_min,
          districtName: `Zone ${rent.zone}`,
          isFurnished: null,
          roomCount: this.normalizedRoomCount(
            rent.nombre_pieces_homogene,
          ).toString(),
          yearBuilt: rent.epoque_construction_homogene,
        }

        if (canHaveHouse(this.mainCity)) {
          res['isHouse'] = rent.Type_habitat === 'Maison' ? 'Maison' : null
        }

        return res
      })
      .sort((a, b) => {
        return (
          this.rangeTime.indexOf(a.yearBuilt) -
          this.rangeTime.indexOf(b.yearBuilt)
        )
      })
  }

  private normalizedRoomCount(nombre_pieces_homogene: string): string | number {
    const match = nombre_pieces_homogene.match(/^(\d)P\+?$/i)
    return match
      ? parseInt(match[1]) === 4
        ? '4 et plus'
        : parseInt(match[1])
      : ''
  }
}
