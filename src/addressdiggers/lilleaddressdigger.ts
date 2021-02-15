import { Ad } from "@interfaces/ad";
import { AddressDigStrategy, AddressInfo } from "@interfaces/addressdigger";
import { CityInfo } from "@services/city";

export class LilleAddressDigger implements AddressDigStrategy {
    cityInfo: CityInfo;
    constructor(
        cityInfo: CityInfo,
    ) {
        this.cityInfo = cityInfo
    }

    digForAddress(ad: Ad): Promise<AddressInfo> {
        return (Promise.resolve() as unknown) as Promise<AddressInfo>;
    }
}