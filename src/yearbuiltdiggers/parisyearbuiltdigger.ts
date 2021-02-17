import { Coordinate } from "@interfaces/shared";
import { YearBuiltDigStrategy } from '@interfaces/yearbuiltdigger';


export class ParisYearBuiltDigger implements YearBuiltDigStrategy {
    digForYearBuilt(coordinates?: Coordinate): Promise<number[]> {
        return "" as unknown as Promise<number[]>
    }
}