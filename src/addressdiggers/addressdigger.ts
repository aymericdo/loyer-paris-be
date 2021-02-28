import { ErrorCode } from "@services/api-errors";
import { LilleAddressDigger } from "@addressdiggers/lilleaddressdigger";
import { ParisAddressDigger } from "@addressdiggers/parisaddressdigger";
import { Ad } from "../interfaces/ad";
import { Coordinate } from "../interfaces/shared";
import { AvailableCities } from '@services/city';

export interface AddressDiggerOutput {
    address: string
    postalCode: string;
    stations: string[]
    coordinates: Coordinate
    blurryCoordinates: Coordinate
}

export interface AddressDigStrategy {
    digForAddress(ad: Ad): AddressDiggerOutput;
}

export class AddressDigger implements AddressDigStrategy {
    city: AvailableCities;
    constructor(
        city: AvailableCities,
    ) {
        this.city = city
    }

    digForAddress(ad: Ad): AddressDiggerOutput {
        const addressDiggerStrategyFactory = new AddressDiggerStrategyFactory();
        return addressDiggerStrategyFactory.getDiggerStrategy(this.city).digForAddress(ad);
    }
}

export class AddressDiggerStrategyFactory {
    getDiggerStrategy(city: AvailableCities): AddressDigStrategy {
        const parisDigger = new ParisAddressDigger(city);
        const lilleDigger = new LilleAddressDigger(city);
        const noDigger = new NoAddressDigger(city as string);
        switch (city) {
            case "paris": {
                return parisDigger;
            }
            case 'lille':
            case 'hellemmes':
            case 'lomme': {
                return lilleDigger;
            }
            default: {
                return noDigger;
            }
        }
    }
}

export class NoAddressDigger implements AddressDigStrategy {
    city: string;
    constructor(
        city: string,
    ) {
        this.city = city
    }
    digForAddress(_: Ad): AddressDiggerOutput {
        throw { error: ErrorCode.City, msg: `city not ${this.city} found in the list` }
    }
}