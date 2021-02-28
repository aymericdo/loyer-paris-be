import { ErrorCode } from "@services/api-errors";
import { LilleRentFilter } from "@rentfilters/lillerentfilter";
import { ParisRentFilter } from "@rentfilters/parisrentfilter";
import { CleanAd, FilteredResult } from "@interfaces/ad";
import { Coordinate } from "@interfaces/shared";
import { AvailableCities } from '@services/city';

export interface RentFilterOutput {
    address: string
    postalCode: string;
    city: string;
    stations: string[]
    coordinates: Coordinate
    blurryCoordinates: Coordinate
}

export interface RentFilterStrategy {
    filter(cleanAd: CleanAd): FilteredResult;
}

export class RentFilter implements RentFilterStrategy {
    city: AvailableCities;
    constructor(
        city: AvailableCities,
    ) {
        this.city = city
    }

    filter(cleanAd: CleanAd): FilteredResult {
        const rentFilterStrategyFactory = new RentFilterStrategyFactory();
        return rentFilterStrategyFactory.getDiggerStrategy(this.city).filter(cleanAd);
    }
}

export class RentFilterStrategyFactory {
    getDiggerStrategy(city: AvailableCities): RentFilterStrategy {
        const parisDigger = new ParisRentFilter(city);
        const lilleDigger = new LilleRentFilter(city);
        const noDigger = new NoRentFilter(city);
        switch (city) {
            case "paris": {
                return parisDigger;
            }
            case "lille":
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

export class NoRentFilter implements RentFilterStrategy {
    city: AvailableCities;
    constructor(
        city: AvailableCities,
    ) {
        this.city = city
    }
    filter(_: CleanAd): FilteredResult {
        throw { error: ErrorCode.City, msg: `city not ${this.city} found in the list` }
    }
}