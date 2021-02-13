import { CleanAd } from "./ad";

interface DigStrategy {
    digInAd(): Promise<CleanAd>;
}

export class Digger implements DigStrategy {
    constructor(private city: string) { }
    diggerStrategyFactory = new DiggerStrategyFactory();

    digInAd(): Promise<CleanAd> {
        return this.diggerStrategyFactory.getDiggerStrategy(this.city).digInAd();
    }
}

export class DiggerStrategyFactory {
    parisDigger = new ParisDigger();
    lilleDigger = new LilleDigger();
    noDigger = new NoDigger();

    getDiggerStrategy(city: string): DigStrategy {
        switch (city.toLowerCase()) {
            case "paris": {
                return this.parisDigger;
            }
            case "lille": {
                return this.lilleDigger;
            }
            default: {
                return this.noDigger;
            }
        }
    }
}

export class ParisDigger implements DigStrategy {
    digInAd(): Promise<CleanAd> {
        return (Promise.resolve() as unknown) as Promise<CleanAd>;
    }
}

export class LilleDigger implements DigStrategy {
    digInAd(): Promise<CleanAd> {
        return (Promise.resolve() as unknown) as Promise<CleanAd>;
    }
}

export class NoDigger implements DigStrategy {
    digInAd(): Promise<CleanAd> {
        return (Promise.resolve() as unknown) as Promise<CleanAd>;
    }
}
