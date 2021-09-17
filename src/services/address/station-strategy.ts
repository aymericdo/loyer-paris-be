import { LilleStationItem } from '@interfaces/json-item-lille'
import { ParisStationItem } from '@interfaces/json-item-paris'
import { StationItem } from '@interfaces/shared'
import * as fs from 'fs'
import Fuse from 'fuse.js'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'

export interface StationSearchStrategy {
  getStations(words: string[]): StationItem[]
}

export class ParisStationSearchStrategy implements StationSearchStrategy {
  @Memoize()
  private parisStationsJson(): ParisStationItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/metros_paris.json'), 'utf8')
    )
  }

  public getStations(words: string[]) {
    const options = {
      keys: ['tags.name'],
      threshold: 0.2,
      includeScore: true,
    }

    if (!words.length) {
      return null
    }

    const stations: ParisStationItem[] = this.parisStationsJson()
    const fuse = new Fuse(stations, options)
    return words
      .map((word) => {
        const res =
          word.length > 3 &&
          (fuse.search(word, { limit: 1 }) as {
            score: number
            item: ParisStationItem
          }[])
        return res && res.length && res[0]
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .map((a) => a.item)
  }
}

export class LilleStationSearchStrategy implements StationSearchStrategy {
  @Memoize()
  private lilleStationsJson(): LilleStationItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/metros_lille.json'), 'utf8')
    )
  }
  public getStations(words: string[]) {
    const options = {
      keys: ['fields.stop_name'],
      threshold: 0.05,
      includeScore: true,
    }

    if (!words.length) {
      return null
    }

    const stations: LilleStationItem[] = this.lilleStationsJson()
    const fuse = new Fuse(stations, options)
    return words
      .map((word) => {
        const res =
          word.length > 3 &&
          (fuse.search(word, { limit: 1 }) as {
            score: number
            item: LilleStationItem
          }[])
        return res && res.length && res[0]
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .map((a) => a.item)
  }
}

export class PlaineCommuneStationSearchStrategy
  implements StationSearchStrategy
{
  public getStations(_: string[]) {
    return []
  }
}
