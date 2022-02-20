import * as fs from "fs";
import * as path from "path";

import Fuse from "fuse.js";
import { StationItem } from "@interfaces/shared";
import { cityList } from "./city";
import { Ad } from "@interfaces/ad";

const jsonMapping = {
  paris: JSON.parse(
    fs.readFileSync(path.join("json-data/metros_paris.json"), "utf8")
  ),
  lille: JSON.parse(
    fs.readFileSync(path.join("json-data/metros_paris.json"), "utf8")
  ),
};

const nameMapping = { paris: ["tags.name"], lille: ["fields.stop_name"] };

export class StationService {
  getStations(city: string, ad: Ad): string[] {
    const stations: StationItem[] =
      (ad.stations && this.filterStations(city, ad.stations)) ||
      (ad.description && this.filterStations(city, ad.description.split(" ")));
    return stations && this.nearestStationInTargetPolygon(stations);
  }

  private filterStations(city: string, words: string[]): StationItem[] {
    const options = {
      keys: nameMapping[cityList[city].mainCity],
      threshold: 0.2,
      includeScore: true,
    };

    if (!words.length) {
      return null;
    }

    const stations: StationItem[] = jsonMapping[cityList[city].mainCity];
    const fuse = new Fuse(stations, options);
    return words
      .map((word) => {
        const res =
          word.length > 3 &&
          (fuse.search(word, { limit: 1 }) as {
            score: number;
            item: StationItem;
          }[]);
        return res && res.length && res[0];
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .map((a) => a.item);
  }

  protected nearestStationInTargetPolygon(stations: StationItem[]): string[] {
    return;
  }
}
