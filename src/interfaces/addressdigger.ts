import { ErrorCode } from "@services/api-errors";
import { CityInfo } from "@services/city";
import { LilleAddressDigger } from "addressdiggers/lilleaddressdigger";
import { ParisAddressDigger } from "addressdiggers/parisaddressdigger";
import { Ad } from "./ad";
import { Coordinate } from "./shared";

export interface AddressInfo {
    address: string
    coordinates: Coordinate
    blurryCoordinates: Coordinate
}

export interface AddressDigStrategy {
    digForAddress(ad: Ad): Promise<AddressInfo>;
}

export class AddressDigger implements AddressDigStrategy {
    cityInfo: CityInfo;
    constructor(
        cityInfo: CityInfo,
    ) {
        this.cityInfo = cityInfo
    }

    digForAddress(ad: Ad): Promise<AddressInfo> {
        const addressDiggerStrategyFactory = new AddressDiggerStrategyFactory(this.cityInfo);
        return addressDiggerStrategyFactory.getDiggerStrategy(this.cityInfo.city).digForAddress(ad);
    }
}

export class AddressDiggerStrategyFactory {
    cityInfo: CityInfo;
    constructor(
        cityInfo: CityInfo,
    ) {
        this.cityInfo = cityInfo
    }



    getDiggerStrategy(city: string): AddressDigStrategy {
        const parisDigger = new ParisAddressDigger(this.cityInfo);
        const lilleDigger = new LilleAddressDigger(this.cityInfo);
        const noDigger = new NoAddressDigger(this.cityInfo);
        switch (city.toLowerCase()) {
            case "paris": {
                return parisDigger;
            }
            case "lille": {
                return lilleDigger;
            }
            default: {
                return noDigger;
            }
        }
    }
}

export class NoAddressDigger implements AddressDigStrategy {
    cityInfo: CityInfo;
    constructor(
        cityInfo: CityInfo,
    ) {
        this.cityInfo = cityInfo
    }
    digForAddress(ad: Ad): Promise<AddressInfo> {
        throw { error: ErrorCode.City, msg: `city not ${this.cityInfo.city} found in the list` }
    }
}