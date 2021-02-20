import { LilleAddressItem, ParisAddressItem } from "@interfaces/json-item";
import path from "path";
import * as fs from 'fs'
import { ErrorCode } from "./api-errors";

const parisAddresses: ParisAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))
const lilleAddresses: LilleAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'))

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

export class CityService {
  city: string;

  constructor(
    city: string,
  ) {
    this.city = city;

    if (!Object.keys(cityList).includes(this.city)) {
      throw { error: ErrorCode.City, msg: `city "${this.city}" not found in the list` }
    }
  }

}
