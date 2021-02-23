import * as cleanup from '@helpers/cleanup'
import { ErrorCode } from "../api-errors";
import { Ad } from "@interfaces/ad";

type CityList = {
  [key: string]: {
    postalCodePossibilities: string[];
    postalCodeRegex: RegExp[],
  }
}

export const cityList: CityList = {
  paris: {
    postalCodePossibilities: [
      '75001','75002','75003','75004','75005','75006',
      '75007','75008', '75009','75010','75011','75012',
      '75013','75014','75015','75016', '75116','75017',
      '75018','75019','75020',
    ],
    postalCodeRegex: [/\b75[0-1][0-9]{2}\b/g, /((?<=paris )[0-9]{1,2})|([0-9]{1,2} ?(?=er|ème|e|eme))/g],
  },
  lille: {
    postalCodePossibilities: [
      '59000', '59260', '59160', '59800', '59777',
    ],
    postalCodeRegex: [/\b59[0-1][0-9]{2}\b/g],
  },
  hellemmes: {
    postalCodePossibilities: ['59260'],
    postalCodeRegex: [/\b59[0-1][0-9]{2}\b/g],
  },
  lomme: {
    postalCodePossibilities: ['59160'],
    postalCodeRegex: [/\b59[0-1][0-9]{2}\b/g],
  },
};

export type AvailableCities = keyof typeof cityList;

export class CityService {
  static findCity(ad: Ad): AvailableCities {
    const city = ad.cityLabel?.match(/[A-Za-z -]+/g) && cleanup.string(ad.cityLabel.match(/[A-Za-z -]+/g)[0]);

    if (!Object.keys(cityList).includes(city)) {
      throw { error: ErrorCode.City, msg: `city "${city}" not found in the list` }
    }

    return city as AvailableCities;
  }
}
