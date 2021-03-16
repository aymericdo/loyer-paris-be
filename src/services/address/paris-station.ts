import * as fs from 'fs'
import * as path from 'path'
import { ParisStationItem } from '@interfaces/json-item-paris'
import Fuse from 'fuse.js'
import { Memoize } from 'typescript-memoize'

export class ParisStationService {
  constructor() {}

  getStations(words: string[]): ParisStationItem[] {
    const options = {
      keys: ['tags.name'],
      threshold: 0.2,
      includeScore: true,
    }

    if (!words.length) {
      return null
    }

    const parisStations: ParisStationItem[] = this.parisStationsJson()
    const fuse = new Fuse(parisStations, options)
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

  @Memoize()
  private parisStationsJson(): ParisStationItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/metros_paris.json'), 'utf8')
    )
  }
}
