import { Ad } from "./ad";

interface MapStrategy {
    mapping(): Promise<Ad>;
}

export class Mapper implements MapStrategy {
    constructor(private website: string) { }
    MapperStrategyFactory = new MapperStrategyFactory();

    mapping(): Promise<Ad> {
        return this.MapperStrategyFactory.getMapperStrategy(this.website).mapping();
    }
}

class MapperStrategyFactory {
    facebookMapper = new FacebookMapper();
    leboncoinMapper = new LeboncoinMapper();
    lefigaroMapper = new LefigaroMapper();
    logicimmoMapper = new LogicimmoMapper()
    loueragileMapper = new LoueragileMapper();
    orpiMapper = new OrpiMapper();
    papMapper = new PapMapper();
    selogerMapper = new SelogerMapper();
    noMapper = new NoMapper();

    getMapperStrategy(website: string): MapStrategy {
        switch (website.toLowerCase()) {
            case "facebook": {
                return this.facebookMapper;
            }
            case "leboncoin": {
                return this.leboncoinMapper;
            }
            case "lefigaro": {
                return this.lefigaroMapper;
            }
            case "logicimmo": {
                return this.logicimmoMapper;
            }
            case "loueragile": {
                return this.loueragileMapper;
            }
            case "orpi": {
                return this.orpiMapper;
            }
            case "pap": {
                return this.papMapper;
            }
            case "seloger": {
                return this.selogerMapper;
            }
            default: {
                return this.noMapper;
            }
        }
    }
}

export class FacebookMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class LeboncoinMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class LefigaroMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class LogicimmoMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class LoueragileMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class OrpiMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class PapMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class SelogerMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}

export class NoMapper implements MapStrategy {
    mapping(): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}
