import { ZoneDocument } from '@db/zone.model'
import { FilteredResult } from '@interfaces/ad'
import {
  ParisDistrictItemProperties,
  ParisEncadrementItem,
  ParisQuartierItem,
} from '@interfaces/paris'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FilterParent } from '@services/filters/encadrement-filter/filter-parent'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'

const mappingQuartierZoneParisJson: ParisQuartierItem[] = JSON.parse(
  fs.readFileSync(
    path.join('json-data/encadrements_paris_quartiers.json'),
    'utf8',
  ),
)

export class ParisFilter extends FilterParent {
  mainCity: AvailableMainCities = 'paris'
  criteriaJsonPath = 'json-data/encadrements_paris.json'
  // Extract possible range time from rangeRents (json-data/encadrements_paris.json)
  rangeTime: string[] = ['Avant 1946', '1946-1970', '1971-1990', 'Après 1990']

  protected async isDistrictMatch(
    districtsMatched: ZoneDocument[],
    rangeRent: ParisEncadrementItem,
  ): Promise<boolean> {
    const zones = this.getParisZones(districtsMatched)
    return zones?.length
      ? zones.some((zoneRent) => zoneRent.id_zone === rangeRent.id_zone)
      : true
  }

  protected async isRoomCountMatch(
    rangeRent: ParisEncadrementItem,
  ): Promise<boolean> {
    return this.infoToFilter.roomCount
      ? +this.infoToFilter.roomCount < 4
        ? +rangeRent.piece === +this.infoToFilter.roomCount
        : rangeRent.piece.toString() === '4 et plus'
      : true
  }

  protected async isYearBuiltMatch(
    rangeRent: ParisEncadrementItem,
  ): Promise<boolean> {
    const dateRange = this.dateRangeMatched()
    return dateRange?.length ? dateRange.includes(rangeRent.epoque) : true
  }

  async isHasFurnitureMatch(rangeRent: ParisEncadrementItem): Promise<boolean> {
    return this.infoToFilter.hasFurniture != null
      ? this.infoToFilter.hasFurniture
        ? !!rangeRent.meuble_txt.match(/^meubl/g)?.length
        : !!rangeRent.meuble_txt.match(/^non meubl/g)?.length
      : true
  }

  protected async filterRents(): Promise<
    (ParisEncadrementItem & { districtName: string })[]
  > {
    let currentYear = +new Date().getFullYear()

    if (new Date().getMonth() < 6) {
      currentYear -= 1
    }

    const rangeRents = this.rangeRentsJson() as ParisEncadrementItem[]
    const districtsMatched = await super.districtsMatched()
    const zones = this.getParisZones(districtsMatched)

    return (
      await Promise.all(
        rangeRents.map(async (rangeRent) => ({
          value: rangeRent,
          include:
            rangeRent.annee === currentYear &&
            (await this.isDistrictMatch(districtsMatched, rangeRent)) &&
            (await this.isYearBuiltMatch(rangeRent)) &&
            (await this.isRoomCountMatch(rangeRent)) &&
            (await this.isHasFurnitureMatch(rangeRent)) &&
            (await this.isHasHouseMatch(rangeRent)),
        })),
      )
    )
      .filter(
        (v: { value: ParisEncadrementItem; include: boolean }) => v.include,
      )
      .map(({ value }) => value)
      .map((rangeRent: ParisEncadrementItem) => {
        return {
          ...rangeRent,
          districtName: zones.find((zone) => zone.id_zone === rangeRent.id_zone)
            .nom_quartier,
        }
      })
  }

  protected async mappingResult(
    rentList: (ParisEncadrementItem & { districtName: string })[],
  ): Promise<FilteredResult[]> {
    return rentList
      .map((r) => ({
        maxPrice: +r.max,
        minPrice: +r.min,
        districtName: r.districtName,
        isFurnished: !!r.meuble_txt.match(/^meubl/g),
        roomCount: r.piece.toString(),
        yearBuilt: r.epoque,
      }))
      .sort((a, b) => {
        return (
          this.rangeTime.indexOf(a.yearBuilt) -
          this.rangeTime.indexOf(b.yearBuilt)
        )
      })
  }

  @Memoize()
  private getParisZones(districtsMatched: ZoneDocument[]): ParisQuartierItem[] {
    if (!districtsMatched?.length) {
      return []
    }

    const quartiersMatched = districtsMatched.map(
      (district) => (district.properties as ParisDistrictItemProperties).c_qu,
    )
    return mappingQuartierZoneParisJson.filter((zoneRent) => {
      return quartiersMatched.includes(zoneRent.id_quartier)
    })
  }
}
