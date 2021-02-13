import { FacebookMapper } from "websites/facebook";
import { LeBonCoinMapper } from "websites/leboncoin";
import { LeFigaroMapper } from "websites/lefigaro";
import { LogicImmoMapper } from "websites/logicimmo";
import { OrpiMapper } from "websites/orpi";
import { PapMapper } from "websites/pap";
import { SelogerMapper } from "websites/seloger";
import { Ad } from "./ad";

export interface MapStrategy {
    mapping(body: string): Promise<Ad>;
}

export class Mapper implements MapStrategy {
    constructor(private website: string, private body: any) { }
    MapperStrategyFactory = new MapperStrategyFactory();

    mapping(): Promise<Ad> {
        return this.MapperStrategyFactory.getMapperStrategy(this.website).mapping(this.body);
    }
}

class MapperStrategyFactory {
    facebookMapper = new FacebookMapper();
    leboncoinMapper = new LeBonCoinMapper();
    lefigaroMapper = new LeFigaroMapper();
    logicimmoMapper = new LogicImmoMapper()
    loueragileMapper = new NoMapper();
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
export class NoMapper implements MapStrategy {
    mapping(_: string): Promise<Ad> {
        return (Promise.resolve() as unknown) as Promise<Ad>;
    }
}
