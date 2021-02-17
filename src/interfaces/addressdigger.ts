import { ErrorCode } from "@services/api-errors";
import { LilleAddressDigger } from "addressdiggers/lilleaddressdigger";
import { ParisAddressDigger } from "addressdiggers/parisaddressdigger";
import { Ad } from "./ad";
import { Coordinate } from "./shared";

export interface AddressDiggerOutput {
    address: string
    postalCode: string;
    city: string;
    stations: string[]
    coordinates: Coordinate
    blurryCoordinates: Coordinate
}

export interface AddressDigStrategy {
    digForAddress(ad: Ad): AddressDiggerOutput;
}

export class AddressDigger implements AddressDigStrategy {
    city: string;
    constructor(
        city: string,
    ) {
        this.city = city
    }

    digForAddress(ad: Ad): AddressDiggerOutput {
        const addressDiggerStrategyFactory = new AddressDiggerStrategyFactory();
        return addressDiggerStrategyFactory.getDiggerStrategy(this.city).digForAddress(ad);
    }
}

export class AddressDiggerStrategyFactory {
    getDiggerStrategy(city: string): AddressDigStrategy {
        const parisDigger = new ParisAddressDigger(city);
        const lilleDigger = new LilleAddressDigger(city);
        const noDigger = new NoAddressDigger(city);
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