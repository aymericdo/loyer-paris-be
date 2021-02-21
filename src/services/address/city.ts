import * as cleanup from '@helpers/cleanup'
import { ErrorCode } from "../api-errors";
import { Ad } from "@interfaces/ad";

export const cityList = ['paris', 'lille'];
export type AvailableCities = typeof cityList[number];

export class CityService {
  constructor (
  ) { }

  static findCity(ad: Ad): AvailableCities {
    const city = ad.cityLabel?.match(/[A-Za-z -]+/g) && cleanup.string(ad.cityLabel.match(/[A-Za-z -]+/g)[0]);

    if (!cityList.includes(city)) {
      throw { error: ErrorCode.City, msg: `city "${city}" not found in the list` }
    }

    return city as AvailableCities;
  }
}
