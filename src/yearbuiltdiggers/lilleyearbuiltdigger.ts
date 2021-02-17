import { Coordinate } from "@interfaces/shared";
import { YearBuiltDigStrategy } from "@interfaces/yearbuiltdigger";

export class LilleYearBuiltDigger implements YearBuiltDigStrategy {
    digForYearBuilt(coordinates?: Coordinate): Promise<number[]> {
        return "" as unknown as Promise<number[]>
    }
}