import { regexString } from "@helpers/regex";
import { Ad } from "@interfaces/ad";
import { AddressItem } from "@interfaces/shared";
import { cityList } from "./city";
import * as cleanup from "@helpers/cleanup";
import {
  LilleAddress,
  LyonAddress,
  ParisAddress,
  PlaineCommuneAddress,
} from "@db/db";

const dbMapping = {
  paris: ParisAddress,
  lyon: LyonAddress,
  lille: LilleAddress,
  plaineCommune: PlaineCommuneAddress,
};

export interface AddressStrategy {
  getAddress(city: string, postalCode: string, ad: Ad): Promise<string>;
}

export class AddressStrategyFactory {
  getDiggerStrategy(city: string): AddressStrategy {
    const parisStrategy = new ParisAddressStrategy();
    const defaultStrategy = new DefaultAddressStrategy();
    switch (city) {
      case "paris": {
        return parisStrategy;
      }
      default: {
        return defaultStrategy;
      }
    }
  }
}

export class DefaultAddressStrategy implements AddressStrategy {
  public async getAddress(
    city: string,
    postalCode: string,
    ad: Ad
  ): Promise<string> {
    const tab = [ad.address, ad.title, ad.description].filter(Boolean);

    for (const text of tab) {
      const result = await this.digForAddressInText(city, postalCode, text);
      if (result) {
        return result;
      }
    }
  }

  protected async digForAddressInText(
    city: string,
    postalCode: string,
    text: string
  ): Promise<string> {
    const addressRe = new RegExp(regexString("address"));
    const addressesFromRegex = text.match(addressRe) as string[];

    if (addressesFromRegex?.length) {
      const addressesQueries = this.querifyAddresses(city, addressesFromRegex);
      const result: {
        item: AddressItem;
        score: number;
        streetNumber: string;
      }[] = (
        await Promise.all(
          addressesQueries.map(async (query) => {
            return await this.getAddressCompleted(city, query);
          })
        )
      )
        .flat()
        .filter((r) => (postalCode ? r.item.postalCode === postalCode : true))
        .sort((a, b) => b.score - a.score);

      if (result?.length) {
        // this.setCoordinates(result[0].item.coordinate, result[0].streetNumber);
        return "";
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  protected querifyAddresses(
    city: string,
    addressesFromRegex: string[]
  ): string[] {
    return addressesFromRegex
      .map((a) =>
        cleanup.address(a, city) ? `${cleanup.address(a, city)}` : null
      )
      .filter(Boolean);
  }

  protected async getAddressCompleted(
    city: string,
    query: string
  ): Promise<
    {
      item: AddressItem;
      score: number;
      streetNumber: string;
    }[]
  > {
    if (!query) {
      return null;
    }
    const addressDb = dbMapping[cityList[city].mainCity];
    const result = (await addressDb
      .find(
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

  protected getStations(): string[] {
    return [];
  }

  protected nearestStations(): string[] {
    return [];
  }
}

export class ParisAddressStrategy extends DefaultAddressStrategy {}
