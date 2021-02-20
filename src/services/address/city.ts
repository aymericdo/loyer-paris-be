import { AddressItem } from "@interfaces/json-item";
import * as cleanup from '@helpers/cleanup'
import path from "path";
import * as fs from 'fs'
import { ErrorCode } from "../api-errors";
import { Ad } from "@interfaces/ad";

const parisAddresses: AddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))
const lilleAddresses: AddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'))

export const cityList = {
  paris: {
    addresses: parisAddresses,
    addressesField: 'l_adr'
  },
  lille: {
    addresses: lilleAddresses,
    addressesField: 'auto_adres',
  },
};

export type AvailableCities = keyof typeof cityList;

export class CityService {
  constructor (
  ) { }

  static findCity(ad: Ad): AvailableCities {
    const city = ad.cityLabel?.match(/[A-Za-z -]+/g) && cleanup.string(ad.cityLabel.match(/[A-Za-z -]+/g)[0]);

    if (!Object.keys(cityList).includes(city)) {
      throw { error: ErrorCode.City, msg: `city "${city}" not found in the list` }
    }

    return city as AvailableCities;
  }
}
