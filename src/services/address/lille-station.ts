import * as fs from 'fs'
import * as path from 'path'
import Fuse from 'fuse.js'
import { Memoize } from 'typescript-memoize'
import { LilleStationItem } from '@interfaces/json-item-lille'

export class LilleStationService {
  constructor() {}

  getStations(words: string[]): LilleStationItem[] {
    const options = {
      keys: ['fields.stop_name'],
      threshold: 0.05,
      includeScore: true,
    }

    if (!words.length) {
      return null
    }

    const parisStations: LilleStationItem[] = this.lilleStationsJson()
    const fuse = new Fuse(parisStations, options)
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

  @Memoize()
  private lilleStationsJson(): LilleStationItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/metros_lille.json'), 'utf8')
    )
  }
}
