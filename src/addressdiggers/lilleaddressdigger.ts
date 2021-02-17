import { Ad } from "@interfaces/ad";
import { AddressDigStrategy, AddressInfo } from "@interfaces/addressdigger";
import { AddressItem } from "@interfaces/json-item";
import { CityInfo } from "@services/city";
import * as fs from 'fs';
import path from "path";

const lilleAddresses: AddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'))

export class LilleAddressDigger implements AddressDigStrategy {
    cityInfo: CityInfo;
    constructor(
        cityInfo: CityInfo,
    ) {
        this.cityInfo = cityInfo
    }

    digForAddress(ad: Ad): AddressInfo {
        return "" as unknown as AddressInfo;
    }
}