import * as cleanup from "@helpers/cleanup";
import inside from "point-in-polygon";
import { AddressItem, Coordinate } from "@interfaces/shared";
import { Ad } from "@interfaces/ad";
import { regexString } from "@helpers/regex";
import { Memoize } from "typescript-memoize";
import { min } from "@helpers/functions";
import { DistanceService } from "../distance";
import { AvailableCities, cityList } from "./city";

export abstract class AddressService {
  ad: Ad = null;
  city: AvailableCities = null;
  postalCode: string;
  coordinates: Coordinate;
  blurryCoordinates: Coordinate;

  constructor(city: AvailableCities, ad: Ad) {
    this.ad = ad;
    this.city = city;
  }

  async getAddress(postalCode: string): Promise<string> {
    const tab = [this.ad.address, this.ad.title, this.ad.description].filter(
      Boolean
    );

    for (const text of tab) {
      const result = await this.digForAddressInText(postalCode, text);
      if (result) {
        return result;
      }
    }
  }

  getCoordinate(blurry = false): Coordinate {
    const coordinatesFromAd =
      this.ad.coord?.lng && this.ad.coord?.lat
        ? {
            lng: this.ad.coord.lng,
            lat: this.ad.coord.lat,
          }
        : null;

    if (
      coordinatesFromAd?.lng.toString().length > 9 &&
      coordinatesFromAd?.lat.toString().length > 9
    ) {
      return coordinatesFromAd;
    } else {
      if (blurry) {
        return this.blurryCoordinates || coordinatesFromAd;
      } else {
        return this.coordinates || coordinatesFromAd;
      }
    }
  }

  getStations(): string[] {
    return [];
  }

  abstract getAddressCompleted(q: string): Promise<
    {
      item: AddressItem;
      score: number;
      streetNumber: string;
    }[]
  >;
  abstract getTargetPolygon(): number[][];
  abstract addressFromCoordinate(coord: Coordinate): string;

  protected setCoordinates(coord: Coordinate, streetNumber: string): void {
    if (streetNumber) {
      this.coordinates = { ...coord };
    } else {
      this.blurryCoordinates = { ...coord };
    }
  }

  protected setPostalCode(postalCode: string): void {
    this.postalCode = postalCode;
  }

  private async digForAddressInText(
    postalCode: string,
    text: string
  ): Promise<string> {
    const addressRe = new RegExp(regexString("address"));
    const addressesFromRegex = text.match(addressRe) as string[];

    if (addressesFromRegex?.length) {
      const addressesQueries = this.querifyAddresses(addressesFromRegex);
      const result: {
        item: AddressItem;
        score: number;
        streetNumber: string;
      }[] = (
        await Promise.all(
          addressesQueries.map(async (query) => {
            return await this.getAddressCompleted(query);
          })
        )
      )
        .flat()
        .filter((r) => (postalCode ? r.item.postalCode === postalCode : true))
        .sort((a, b) => b.score - a.score);

      if (result?.length) {
        this.setCoordinates(result[0].item.coordinate, result[0].streetNumber);

        if (this.city === "paris") {
          // More precision with polygon that we are targeting for sure
          const resultInPostalCode = this.nearestAddressInTargetPolygon(result);
          return resultInPostalCode
            ? resultInPostalCode.streetNumber
              ? cleanup
                  .string(resultInPostalCode.address)
                  .replace(
                    /^\d+(b|t)?/g,
                    resultInPostalCode.streetNumber.toString()
                  )
              : cleanup
                  .string(resultInPostalCode.address)
                  .replace(/^\d+(b|t)?/g, "")
                  .trim()
            : null;
        } else {
          return result[0].streetNumber
            ? cleanup
                .string(result[0].item.address)
                .replace(/^\d+(b|t)?/g, result[0].streetNumber.toString())
            : cleanup
                .string(result[0].item.address)
                .replace(/^\d+(b|t)?/g, "")
                .trim();
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private querifyAddresses(addressesFromRegex: string[]): string[] {
    return addressesFromRegex
      .map((a) =>
        cleanup.address(a, this.city)
          ? `${cleanup.address(a, this.city)}`
          : null
      )
      .filter(Boolean);
  }

  private nearestAddressInTargetPolygon(
    addressesCompleted: {
      item: AddressItem;
      streetNumber: string;
      score: number;
    }[]
  ): { address: string; streetNumber: string } {
    const targetPolygon = this.getTargetPolygon();

    if (!targetPolygon) return null;

    const pointByDist: {
      point: number[];
      dist: number;
      item: AddressItem;
      streetNumber: string;
    }[] = addressesCompleted.map((address) => {
      const point = [address.item.coordinate.lng, address.item.coordinate.lat];

      if (inside(point, targetPolygon)) {
        return {
          point,
          dist: 0,
          item: address.item,
          streetNumber: address.streetNumber,
        };
      } else {
        // Get the closest coord but in the right target
        const { point: resPoint, dist } = DistanceService.distanceToPoly(
          point as [number, number],
          targetPolygon as [number, number][]
        );
        return {
          point: resPoint,
          dist,
          item: address.item,
          streetNumber: address.streetNumber,
        };
      }
    });

    if (!pointByDist.length) return null;

    const bah = min(pointByDist.reverse(), "dist");

    // marge d'erreur : 250m (je crois)
    const confidenceThreshold = 0.0025;
    if (bah.dist > confidenceThreshold) {
      return null;
    }

    const coord = { lng: bah.point[0], lat: bah.point[1] };
    if (bah.dist === 0) {
      this.setCoordinates(coord, bah.streetNumber);
      return { address: bah.item.address, streetNumber: bah.streetNumber };
    } else {
      this.setCoordinates(coord, null);
      // Convert the best coord approximation in address string
      return { address: this.addressFromCoordinate(coord), streetNumber: null };
    }
  }
}
