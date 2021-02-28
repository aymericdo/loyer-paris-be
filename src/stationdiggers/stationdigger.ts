import { AvailableCities } from "@services/city";
import { LilleStationDigger } from "@stationdiggers/lillestationdigger";
import { ParisStationDigger } from "@stationdiggers/parisstationdigger";
import { Ad } from "../interfaces/ad";


export interface StationDigStrategy {
    getStations(ad: Ad, postalCode: string): string[];
}

export class StationDigger implements StationDigStrategy {
    city: AvailableCities;
    constructor(
        city: AvailableCities,
    ) {
        this.city = city
    }

    getStations(ad: Ad, postalCode: string): string[] {
        const stationDiggerStrategyFactory = new StationDiggerStrategyFactory();
        return stationDiggerStrategyFactory.getDiggerStrategy(this.city).getStations(ad, postalCode);
    }
}

export class StationDiggerStrategyFactory {
    getDiggerStrategy(city: AvailableCities): StationDigStrategy {
        const parisDigger = new ParisStationDigger();
        const lilleDigger = new LilleStationDigger();
        const noDigger = new NoStationDigger();
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

export class NoStationDigger implements StationDigStrategy {
    getStations(ad: Ad, postalCode: string): string[] {
        return []
    }
}