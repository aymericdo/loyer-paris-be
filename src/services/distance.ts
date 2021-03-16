import * as fs from 'fs'
import { min } from '@helpers/functions'
import { ArrondissementItem } from '@interfaces/json-item-paris'
import path from 'path'
import { Memoize } from 'typescript-memoize'

export class DistanceService {
  static getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    var R = 6371 // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1) // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1)
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c // Distance in km
    return d
  }

  static distanceToPoly(
    point: [number, number],
    poly: [number, number][]
  ): { point: [number, number]; dist: number } {
    const result: { point: [number, number]; dist: number }[] = poly.map(
      (p1: [number, number], index: number) => {
        const prev = (index == 0 ? poly.length : index) - 1
        const p2 = poly[prev]
        const line = this.vsub(p2, p1)

        if (this.vlen(line) === 0) {
          return { point: p1, dist: this.vlen(this.vsub(point, p1)) }
        }

        const norm = this.vnorm(line)
        const x1 = point[0]
        const x2 = norm[0]
        const x3 = p1[0]
        const x4 = line[0]
        const y1 = point[1]
        const y2 = norm[1]
        const y3 = p1[1]
        const y4 = line[1]

        const j =
          (x3 - x1 - (x2 * y3) / y2 + (x2 * y1) / y2) / ((x2 * y4) / y2 - x4)

        if (j < 0 || j > 1) {
          const minDist = Math.min(
            this.vlen(this.vsub(point, p1)),
            this.vlen(this.vsub(point, p2))
          )
          return {
            point: minDist === this.vlen(this.vsub(point, p1)) ? p1 : p2,
            dist: minDist,
          }
        }

        const i = (y3 + j * y4 - y1) / y2

        return { point: p1, dist: this.vlen(this.vscale(norm, i)) }
      }
    )

    return min(result, 'dist')
  }

  private static deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  private static vlen(vector: [number, number]): number {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])
  }

  private static vsub(
    v1: [number, number],
    v2: [number, number]
  ): [number, number] {
    return [v1[0] - v2[0], v1[1] - v2[1]]
  }

  private static vscale(
    vector: [number, number],
    factor: number
  ): [number, number] {
    return [vector[0] * factor, vector[1] * factor]
  }

  private static vnorm(v: [number, number]): [number, number] {
    return [-v[1], v[0]]
  }
}
