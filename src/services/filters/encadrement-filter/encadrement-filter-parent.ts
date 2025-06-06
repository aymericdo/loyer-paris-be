import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { Coordinate, DefaultDistrictItem, DefaultEncadrementItem, DistrictItem, EncadrementItem } from '@interfaces/shared'
import { dateBuiltRange, canHaveHouse } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { YearBuiltService } from '@services/helpers/year-built'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'

export abstract class EncadrementFilterParent {
  DistrictFilter = null
  rangeRentsJsonPath = null
  infoToFilter: InfoToFilter = null
  mainCity: AvailableMainCities
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', 'apres 1990']

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  async filter(): Promise<FilteredResult[]> {
    const rentList = await this.filterRents()
    return await this.mappingResult(rentList)
  }

  async find(): Promise<FilteredResult> {
    const rentList = await this.filter()

    // Get the worst case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) => (prev.maxPrice > current.maxPrice ? prev : current))
      : null

    return worstCase
  }

  rangeTimeToUniversalRangeTime(rangeTime: string): [number, number] {
    const index = this.rangeTime.indexOf(rangeTime)

    if (index === -1) {
      return null
    }

    return dateBuiltRange(this.mainCity)[index]
  }

  protected async districtsMatched(): Promise<DistrictItem[]> {
    return await new this.DistrictFilter({
      coordinates: this.getCoordinate(),
      city: this.infoToFilter.city,
      postalCode: this.infoToFilter.postalCode,
      districtName: this.infoToFilter.districtName,
    }).getDistricts()
  }

  protected dateRangeMatched(): string[] {
    return new YearBuiltService(this.rangeTime, dateBuiltRange(this.mainCity)).getDateRangeFromYearBuilt(this.infoToFilter.yearBuilt)
  }

  protected async isDistrictMatch(districtsMatched: DistrictItem[], rangeRent: EncadrementItem): Promise<boolean> {
    return districtsMatched?.length
      ? districtsMatched.map((district: DefaultDistrictItem) => +district.properties.zone)
        .includes(+(rangeRent as DefaultEncadrementItem).zone)
      : false
  }

  protected async isYearBuiltMatch(rangeRent: EncadrementItem): Promise<boolean> {
    const dateRange = this.dateRangeMatched()
    return dateRange?.length
      ? dateRange.includes((rangeRent as DefaultEncadrementItem).annee_de_construction)
      : true
  }

  protected async isRoomCountMatch(rangeRent: EncadrementItem): Promise<boolean> {
    return this.infoToFilter.roomCount
      ? +this.infoToFilter.roomCount < 4
        ? +(rangeRent as DefaultEncadrementItem).nombre_de_piece === +this.infoToFilter.roomCount
        : (rangeRent as DefaultEncadrementItem).nombre_de_piece === '4 et plus'
      : true
  }

  protected async isHasFurnitureMatch(rangeRent: EncadrementItem): Promise<boolean> {
    return this.infoToFilter.hasFurniture != null
      ? this.infoToFilter.hasFurniture
        ? (rangeRent as DefaultEncadrementItem).meuble
        : !(rangeRent as DefaultEncadrementItem).meuble
      : true
  }

  protected async isHasHouseMatch(rangeRent: EncadrementItem): Promise<boolean> {
    if (!canHaveHouse(this.mainCity)) return true

    return this.infoToFilter.isHouse != null
      ? this.infoToFilter.isHouse
        ? (rangeRent as DefaultEncadrementItem).maison
        : !(rangeRent as DefaultEncadrementItem).maison
      : true
  }

  protected async filterRents(): Promise<EncadrementItem[]> {
    const districtsMatched: DefaultDistrictItem[] = await this.districtsMatched() as DefaultDistrictItem[]

    const rangeRents = (this.rangeRentsJson() as DefaultEncadrementItem[])
    return (await Promise.all(rangeRents.map(async (rangeRent) => ({
      value: rangeRent,
      include: (
        await this.isDistrictMatch(districtsMatched, rangeRent) &&
        await this.isYearBuiltMatch(rangeRent) &&
        await this.isRoomCountMatch(rangeRent) &&
        await this.isHasFurnitureMatch(rangeRent) &&
        await this.isHasHouseMatch(rangeRent)
      )
    }))))
      .filter((v: { value: DefaultEncadrementItem, include: boolean }) => v.include)
      .map(({ value }) => value)
  }

  protected async mappingResult(rentList: EncadrementItem[]): Promise<FilteredResult[]> {
    return rentList
      .map((rent: DefaultEncadrementItem) => {
        const res = {
          maxPrice: +rent.prix_max.toString().replace(',', '.'),
          minPrice: +rent.prix_min.toString().replace(',', '.'),
          districtName: `Zone ${rent.zone}`,
          isFurnished: rent.meuble,
          roomCount: rent.nombre_de_piece,
          yearBuilt: rent.annee_de_construction,
        }

        if (canHaveHouse(this.mainCity)) {
          res['isHouse'] = rent.maison ? 'Maison' : null
        }

        return res
      }).sort((a, b) => {
        return this.rangeTime.indexOf(a.yearBuilt) - this.rangeTime.indexOf(b.yearBuilt)
      })
  }

  protected getCoordinate(): Coordinate {
    return (!!this.infoToFilter.coordinates?.lat && !!this.infoToFilter.coordinates?.lng) ?
      this.infoToFilter.coordinates
      : (!!this.infoToFilter.blurryCoordinates?.lat && !!this.infoToFilter.blurryCoordinates?.lng) ?
        this.infoToFilter.blurryCoordinates
        : null
  }

  @Memoize()
  protected rangeRentsJson(): EncadrementItem[] {
    return JSON.parse(fs.readFileSync(path.join(this.rangeRentsJsonPath), 'utf8'))
  }
}
