import { Coordinate } from "./shared";

export interface YearBuiltDigStrategy {
    digForYearBuilt(coordinates?: Coordinate): Promise<number[]>;
}

export class YearBuiltDigger implements YearBuiltDigStrategy {
    city: string;
    constructor(
        city: string
    ) {
        this.city = city
    }

    digForYearBuilt(coordinates?: Coordinate): Promise<number[]> {
        const yearBuiltDiggerStrategyFactory = new YearBuiltDiggerStrategyFactory();
        return yearBuiltDiggerStrategyFactory.getDiggerStrategy(this.city).digForYearBuilt(coordinates);
    }
}

export class YearBuiltDiggerStrategyFactory {

    getDiggerStrategy(city: string): YearBuiltDigStrategy {
        const parisDigger = new ParisYearBuiltDigger();
        const lilleDigger = new LilleYearBuiltDigger();
        const noDigger = new NoYearBuiltDigger();
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

export class NoYearBuiltDigger implements YearBuiltDigStrategy {
    digForYearBuilt(coordinates?: Coordinate): Promise<number[]> {

    }
}