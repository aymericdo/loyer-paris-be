import * as cleanup from "@helpers/cleanup";
import { regexString } from "@helpers/regex";
import { stringToNumber } from "@helpers/string-to-number";
import { Ad, CleanAd } from "@interfaces/ad";
import { Coordinate } from "@interfaces/shared";
import { YearBuiltService } from "@services/year-built";
import { ErrorCode } from "./api-errors";
import { AvailableCities, CityService } from "./address/city";
import { LilleAddressService } from "./address/lille-address";
import { ParisAddressService } from "./address/paris-address";
import { AddressService } from "./address/address";

export class DigService {
  ad: Ad = null;

  constructor(ad: Ad) {
    this.ad = ad;
  }

  async digInAd(): Promise<CleanAd> {
    const city: AvailableCities = CityService.findCity(this.ad);

    const [
      address,
      postalCode,
      stations,
      coordinates,
      blurryCoordinates,
    ] = this.digForAddress(city);
    const roomCount = this.digForRoomCount();
    const hasFurniture = this.digForHasFurniture();
    const surface = this.digForSurface();
    const price = this.digForPrice();
    // Very edgy case : if 'paris', we have a YearBuilt fallback thanks to emprise batie data
    const yearBuilt = await this.digForYearBuilt(
      city === "paris" ? coordinates : null
    );
    const renter = this.digForRenter();
    const charges = this.digForCharges();
    const hasCharges = this.digForHasCharges();

    return {
      id: this.ad.id,
      roomCount,
      hasFurniture,
      surface,
      price,
      address,
      postalCode,
      city,
      coordinates,
      blurryCoordinates,
      yearBuilt,
      renter,
      stations,
      charges,
      hasCharges,
    };
  }

  private digForAddress(
    city: AvailableCities
  ): [string, string, string[], Coordinate, Coordinate] {
    let addressService: AddressService;
    switch (city) {
      case "paris":
        addressService = new ParisAddressService("paris", this.ad);
        break;
      case "lille":
      case "hellemmes":
      case "lomme":
        addressService = new LilleAddressService(city, this.ad);
        break;
    }

    // Order is important here
    const address = addressService.getAddress();
    const postalCode = addressService.getPostalCode();
    const stations = addressService.getStations();
    const coordinates = addressService.getCoordinate();
    const blurryCoordinates = addressService.getCoordinate(true);

    if (!address && !postalCode && !coordinates) {
      throw { error: ErrorCode.Address, msg: "address not found" };
    }

    return [address, postalCode, stations, coordinates, blurryCoordinates];
  }

  private digForRoomCount(): number {
    const roomsFromTitle =
      this.ad.title &&
      this.ad.title.match(regexString("roomCount")) &&
      this.ad.title.match(regexString("roomCount"))[0];
    const roomsFromDescription =
      this.ad.description &&
      this.ad.description.match(regexString("roomCount")) &&
      this.ad.description.match(regexString("roomCount"))[0];
    return (
      (!!this.ad.rooms && this.ad.rooms) ||
      stringToNumber(roomsFromTitle) ||
      stringToNumber(roomsFromDescription)
    );
  }

  private async digForYearBuilt(coordinates?: Coordinate): Promise<number[]> {
    if (
      this.ad.yearBuilt &&
      this.ad.yearBuilt != null &&
      !isNaN(this.ad.yearBuilt)
    ) {
      return [+this.ad.yearBuilt];
    } else {
      const building =
        coordinates &&
        coordinates.lat &&
        coordinates.lng &&
        (await YearBuiltService.getBuilding(coordinates.lat, coordinates.lng));
      const yearBuiltFromBuilding =
        building && YearBuiltService.getYearBuiltFromBuilding(building);

      return yearBuiltFromBuilding;
    }
  }

  private digForHasFurniture(): boolean {
    const furnitureFromTitle =
      this.ad.title && this.ad.title.match(regexString("furnished"));
    const nonFurnitureFromTitle =
      this.ad.title && this.ad.title.match(regexString("nonFurnished"));
    const furnitureFromDescription =
      this.ad.description &&
      this.ad.description.match(regexString("furnished"));
    const nonFurnitureFromDescription =
      this.ad.description &&
      this.ad.description.match(regexString("nonFurnished"));
    return this.ad.furnished != null
      ? !!this.ad.furnished
      : (furnitureFromDescription && furnitureFromDescription.length > 0) ||
        (furnitureFromTitle && furnitureFromTitle.length > 0)
      ? true
      : (nonFurnitureFromDescription &&
          nonFurnitureFromDescription.length > 0) ||
        (nonFurnitureFromTitle && nonFurnitureFromTitle.length > 0)
      ? false
      : null;
  }

  private digForSurface(): number {
    const surface =
      this.ad.surface ||
      (this.ad.title &&
        this.ad.title.match(regexString("surface")) &&
        cleanup.number(this.ad.title.match(regexString("surface"))[0])) ||
      (this.ad.description &&
        this.ad.description.match(regexString("surface")) &&
        cleanup.number(this.ad.description.match(regexString("surface"))[0]));

    if (!surface) {
      throw { error: ErrorCode.Minimal, msg: "surface not found" };
    }

    return surface;
  }

  private digForPrice(): number {
    if (!this.ad.price) {
      throw { error: ErrorCode.Minimal, msg: "price not found" };
    } else if (this.ad.price > 30000) {
      throw {
        error: ErrorCode.Price,
        msg: `price "${this.ad.price}" too expensive to be a rent`,
      };
    } else if (this.ad.price < 100) {
      throw {
        error: ErrorCode.Price,
        msg: `price "${this.ad.price}" too cheap to be a rent`,
      };
    }

    return this.ad.price;
  }

  private digForRenter(): string {
    const possibleBadRenter = [
      "seloger",
      "loueragile",
      "leboncoin",
      "lefigaro",
      "pap",
      "orpi",
      "logicimmo",
    ];
    return possibleBadRenter.includes(this.ad.renter) ? null : this.ad.renter;
  }

  private digForCharges(): number {
    return (
      this.ad.charges ||
      (this.ad.description?.match(regexString("charges")) &&
        cleanup.price(this.ad.description.match(regexString("charges"))[0]))
    );
  }

  private digForHasCharges(): boolean {
    return this.ad.hasCharges;
  }
}
