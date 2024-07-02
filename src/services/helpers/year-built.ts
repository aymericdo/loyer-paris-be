import { EmpriseBatie } from '@db/db'

export class YearBuiltService {
  rangeTime: string[]
  universalRangeTime: [number, number][]

  constructor(rangeTime: string[], universalRangeTime: [number, number][]) {
    this.rangeTime = rangeTime
    this.universalRangeTime = universalRangeTime
  }

  getDateRangeFromYearBuilt(yearBuilt: number[]): string[] {
    if (!yearBuilt) {
      return null
    }

    const oldestYear = 1000
    const currentYear: number = new Date().getFullYear()

    // if yearBuilt is only one date
    // => possibleYearsBuilt is [yearBuilt]
    // elsif yearBuilt is two elements and the first one is null
    // => possibleYearsBuilt is [oldestYear - yearBuilt[1]]
    // elsif yearBuilt is two elements and the last one is null
    // => possibleYearsBuilt is [yearBuilt[0] - currentYear]
    // elsif yearBuilt is two elements
    // => possibleYearsBuilt is [yearBuilt[0] - yearBuilt[1]]
    const possibleYearsBuilt: number[] =
      yearBuilt.length === 2
        ? yearBuilt[0] === null
          ? Array.from({ length: yearBuilt[1] - oldestYear + 1 }, (v, k) => oldestYear + k)
          : yearBuilt[1] === null
            ? Array.from({ length: currentYear - yearBuilt[0] + 1 }, (v, k) => yearBuilt[0] + 1 + k)
            : Array.from({ length: yearBuilt[1] - yearBuilt[0] + 1 }, (v, k) => yearBuilt[0] + k)
        : yearBuilt

    return this.rangeTime.filter((_time: string, index: number) => {
      // 'avant 1946' -> [null, 1946]
      // '1946-70' -> [1946, 1970]
      const universalRangeTime: number[] = this.universalRangeTime[index]

      return possibleYearsBuilt.some((yb: number) => {
        if (universalRangeTime[0] === null) {
          return yb < +universalRangeTime[1]
        } else if (universalRangeTime[1] === null) {
          return yb > +universalRangeTime[0]
        } else {
          return universalRangeTime[0] < yb && +universalRangeTime[1] >= yb
        }
      })
    })
  }

  static formatAsYearBuilt(dateBuilt: string): number[] {
    if (dateBuilt === '-1') {
      return [+dateBuilt]
    }

    if (dateBuilt.startsWith('<')) {
      return [null, +dateBuilt.match(/\d+/)[0]]
    }

    if (dateBuilt.startsWith('>')) {
      return [+dateBuilt.match(/\d+/)[0], null]
    }

    return dateBuilt.split('-').map((date) => +date)
  }

  static formatAfterBeforeWord(dateStr: string): string {
    const res = dateStr.replace(/apres/i, 'Après')
    return res.replace(/avant/i, 'Avant')
  }

  static getDisplayableYearBuilt(periodBuilt: number[]): string {
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
      return this.formatAfterBeforeWord(periodBuilt.toString())
    }
  }

  // Pour paris only ↴
  static async getEmpriseBatieBuilding(lat: number, lng: number) {
    return await EmpriseBatie.findOne(
      {
        geometry: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 20,
          },
        },
      },
    )
  }

  static getYearBuiltFromBuilding(building) {
    const yearBuilt = building && building.properties.an_const && [+building.properties.an_const]
    const periodBuilt =
      building &&
      building.properties.c_perconst &&
      (building.properties.c_perconst.toLowerCase().includes('avant')
        ? [null, +building.properties.c_perconst.slice(-4)]
        : building.properties.c_perconst.toLowerCase().includes('apres')
          ? [+building.properties.c_perconst.slice(-4), null]
          : [+building.properties.c_perconst.slice(0, 4), +building.properties.c_perconst.slice(-4)])
    return yearBuilt || periodBuilt
  }
}
