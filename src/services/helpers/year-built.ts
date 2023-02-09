import { EmpriseBatie } from '@db/db'

export class YearBuiltService {
  rangeTime: string[]
  yearBuilt: number[]

  constructor(rangeTime: string[], yearBuilt: number[]) {
    this.rangeTime = rangeTime
    this.yearBuilt = yearBuilt
  }

  getRangeTimeDates(): string[] {
    if (!this.yearBuilt) {
      return null
    }

    const oldestYear = 1000
    const currentYear: number = new Date().getFullYear()

    const yearBuiltRange: number[] =
      this.yearBuilt.length === 2
        ? this.yearBuilt[0] === null
          ? Array.from({ length: this.yearBuilt[1] - oldestYear + 1 }, (v, k) => oldestYear + k)
          : this.yearBuilt[1] === null
            ? Array.from({ length: currentYear - this.yearBuilt[0] + 1 }, (v, k) => this.yearBuilt[0] + k)
            : Array.from({ length: this.yearBuilt[1] - this.yearBuilt[0] + 1 }, (v, k) => this.yearBuilt[0] + k)
        : this.yearBuilt

    return this.rangeTime.filter((time: string, index: number) => {
      const rangeYearBuilt: (string | number)[] = time
        .split(/[\s-]+/)
        .map((year: any) => (isNaN(year) ? (index === 0 ? '<' : '>') : this.formatYearDate(year.toString())))

      return yearBuiltRange.some((yb: number) => {
        return typeof rangeYearBuilt[0] === 'number'
          ? rangeYearBuilt[0] < yb && rangeYearBuilt[1] >= yb
          : rangeYearBuilt[0] === '<'
            ? yb < rangeYearBuilt[1]
            : rangeYearBuilt[0] === '>'
              ? yb > rangeYearBuilt[1]
              : false
      })
    })
  }

  static getDateFormatted(periodBuilt: number[]): string {
    if (!periodBuilt) {
      return null
    }

    if (periodBuilt.length > 1) {
      if (periodBuilt[0] === null) {
        return `Avant ${periodBuilt[1]}`
      } else if (periodBuilt[1] === null) {
        return `Après ${periodBuilt[0]}`
      } else {
        return `${periodBuilt[0]}-${periodBuilt[1]}`
      }
    } else {
      return periodBuilt.toString()
    }
  }

  // Pour paris only ↴
  static async getBuilding(lat: number, lng: number) {
    return await EmpriseBatie.findOne(
      {
        geometry: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 20,
          },
        },
      },
      (err, batie) => {
        if (err) {
          console.error(err)
        }

        return batie
      }
    )
  }

  static getYearBuiltFromBuilding(building) {
    const yearBuilt = building && building.properties.an_const && [+building.properties.an_const]
    const periodBuilt =
      building &&
      building.properties.c_perconst &&
      (building.properties.c_perconst.toLowerCase().includes('avant')
        ? [null, +building.properties.c_perconst.slice(-4)]
        : building.properties.c_perconst.toLowerCase().includes('après')
          ? [+building.properties.c_perconst.slice(-4), null]
          : [+building.properties.c_perconst.slice(0, 4), +building.properties.c_perconst.slice(-4)])
    return yearBuilt || periodBuilt
  }

  private formatYearDate(year: string): number {
    if (year.length === 2) {
      return +`19${year}`
    } else {
      return +year
    }
  }
}
