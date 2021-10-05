import { LilleStationItem } from '@interfaces/json-item-lille'
import { ParisStationItem } from '@interfaces/json-item-paris'
import { StationItem } from '@interfaces/shared'
import * as fs from 'fs'
import Fuse from 'fuse.js'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'
import { AvailableCities } from './city'

export interface StationSearchStrategy {
  getStations(words: string[]): StationItem[]
}

export class AddressSearcher implements StationSearchStrategy {
  city: AvailableCities
  constructor(city: AvailableCities) {
    this.city = city
  }

  getStations(words: string[]): StationItem[] {
    const stationSearcherStrategyFactory = new AddressSearcherStrategyFactory()
    return stationSearcherStrategyFactory
      .getSearcherStrategy(this.city.toString())
      .getStations(words)
  }
}

export class AddressSearcherStrategyFactory {
  getSearcherStrategy(city: string): StationSearchStrategy {
    const parisSearcher = new ParisStationSearchStrategy()
    const lilleSearcher = new LilleStationSearchStrategy()
    const plaineCommuneSearcher = new PlaineCommuneStationSearchStrategy()
    const noSearcher = new NoStationSearcher(city as string)
    switch (city) {
      case 'paris': {
        return parisSearcher
      }
      case 'lille':
      case 'hellemmes':
      case 'lomme': {
        return lilleSearcher
      }
      case 'aubervilliers':
      case 'epinay-sur-seine':
      case 'ile-saint-denis':
      case 'courneuve':
      case 'pierrefitte':
      case 'saint-denis':
      case 'saint-ouen':
      case 'stains':
      case 'villetaneuse': {
        return plaineCommuneSearcher
      }
      default: {
        return noSearcher
      }
    }
  }
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

export class NoStationSearcher implements StationSearchStrategy {
  city: string
  constructor(city: string) {
    this.city = city
  }
  getStations(_: string[]): StationItem[] {
    return []
  }
}
