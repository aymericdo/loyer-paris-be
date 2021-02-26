import { LilleStationDigger } from "@stationdiggers/lillestationdigger";
import { ParisStationDigger } from "@stationdiggers/parisstationdigger";
import { Ad } from "../interfaces/ad";


export interface StationDigStrategy {
    getStations(ad: Ad, postalCode: string): string[];
}

export class StationDigger implements StationDigStrategy {
    city: string;
    constructor(
        city: string,
    ) {
        this.city = city
    }

    getStations(ad: Ad, postalCode: string): string[] {
        const stationDiggerStrategyFactory = new StationDiggerStrategyFactory();
        return stationDiggerStrategyFactory.getDiggerStrategy(this.city).getStations(ad, postalCode);
    }
}

export class StationDiggerStrategyFactory {
    getDiggerStrategy(city: string): StationDigStrategy {
        const parisDigger = new ParisStationDigger();
        const lilleDigger = new LilleStationDigger();
        const noDigger = new NoStationDigger();
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

export class NoStationDigger implements StationDigStrategy {
    getStations(ad: Ad, postalCode: string): string[] {
        return []
    }
}