import { AddressService } from "./address-service";
import * as cleanup from "@helpers/cleanup";
import { Memoize } from "typescript-memoize";
import path from "path";
import * as fs from "fs";
import { AddressItem, Coordinate } from "@interfaces/shared";
import { DistanceService } from "@services/distance";
import {
  LilleAddressItem,
  LilleStationItem,
} from "@interfaces/json-item-lille";
import { LilleAddress } from "@db/db";

export class LilleAddressService extends AddressService {
  getStations(): string[] {
    return [];
  }

  nearestStations(stations: LilleStationItem[]): string[] {
    return stations
      .filter((station) => station.fields.stop_desc.includes(this.postalCode))
      .map((station) => station.fields.stop_name);
  }

  @Memoize()
  async getAddressCompleted(query: string): Promise<
    {
      item: AddressItem;
      score: number;
      streetNumber: string;
    }[]
  > {
    if (!query) {
      return null;
    }

    const result = (await LilleAddress.find(
      {
        $text: { $search: query },
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .lean()) as any;

    return result
      ? result.map((r) => ({
          item: {
            address: `${r.numero} ${r.nom_voie}`,
            postalCode: r.code_postal.toString(),
            coordinate: {
              lng: +r.geometry.coordinates[0],
              lat: +r.geometry.coordinates[1],
            },
          },
          score: r.score,
          streetNumber: cleanup.streetNumber(query),
        }))
      : [];
  }

  addressFromCoordinate(coord: Coordinate): string {
    return this.lilleAddressesJson().reduce((prev, current) => {
      const dist = DistanceService.getDistanceFromLatLonInKm(
        coord.lat,
        coord.lng,
        current.lat,
        current.lon
      );
      if (dist < prev.dist || !prev.dist) {
        prev = { dist, current };
      }
      return prev;
    }, {} as { current: any; dist: number })?.current?.fields?.auto_adres;
  }

  // This function return a polygon we found relevant for a city to increase the precision of the address
  // Lille, it's happening...
  getTargetPolygon(): number[][] {
    return null;
  }

  @Memoize()
  private lilleAddressesJson(): LilleAddressItem[] {
    return JSON.parse(
      fs.readFileSync(path.join("json-data/adresse_lille.json"), "utf8")
    ).elements;
  }
}
