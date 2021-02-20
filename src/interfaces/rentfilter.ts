import { LilleRentFilter } from "rentfilters/lillerentfilter";
import { ParisRentFilter } from "rentfilters/parisrentfilter";
import { CleanAd } from "./ad";
import { EncadrementItem } from "./json-item";


export interface RentFilterStrategy {
    filter(cleanAd: CleanAd): EncadrementItem;
}

export class RentFilter implements RentFilterStrategy {
    city: string;
    constructor(
        city: string,
    ) {
        this.city = city
    }

    filter(cleanAd: CleanAd): EncadrementItem {
        const rentFilterStrategyFactory = new RentFilterStrategyFactory();
        return rentFilterStrategyFactory.getDiggerStrategy(this.city).filter(cleanAd);
    }
}

export class RentFilterStrategyFactory {
    getDiggerStrategy(city: string): RentFilterStrategy {
        const parisDigger = new ParisRentFilter();
        const lilleDigger = new LilleRentFilter();
        const noDigger = new NoRentFilter();
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

export class NoRentFilter implements RentFilterStrategy {
    filter(_: CleanAd): EncadrementItem {
        return
    }
}