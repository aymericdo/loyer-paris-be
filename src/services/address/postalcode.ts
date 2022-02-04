import { Ad } from "@interfaces/ad";
import { cityList } from "./city";

export interface PostalCodeDigger {
  getPostalCode(city: string, ad: Ad): string;
}

export class DefaultPostalCodeDigger implements PostalCodeDigger {
  public getPostalCode(city: string, ad: Ad): string {
    return ad.postalCode || this.digForPostalCode(city, ad);
  }

  protected digForPostalCode(city: string, ad: Ad): string {
    // for hellemmes and lomme
    if (cityList[city].postalCodePossibilities.length === 1) {
      return cityList[city].postalCodePossibilities[0];
    }

    const postalCode =
      (ad.postalCode && this.digForPostalCode1(city, ad.postalCode)) ||
      (ad.cityLabel &&
        (this.digForPostalCode1(city, ad.cityLabel) ||
          this.digForPostalCode2(city, ad.cityLabel))) ||
      (ad.title &&
        (this.digForPostalCode1(city, ad.title) ||
          this.digForPostalCode2(city, ad.title))) ||
      (ad.description &&
        (this.digForPostalCode1(city, ad.description) ||
          this.digForPostalCode2(city, ad.description)));

    return postalCode &&
      cityList[city].postalCodePossibilities.includes(postalCode.toString())
      ? postalCode
      : null;
  }

  protected digForPostalCode1(city: string, text: string): string {
    const postalCodeRe = new RegExp(cityList[city].postalCodeRegex[0]);
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim();
  }

  protected digForPostalCode2(city: string, text: string): string {
    return null;
  }
}

export class ParisPostalCodeDigger extends DefaultPostalCodeDigger {
  protected digForPostalCode2(city: string, text: string): string {
    console.log("p2");
    const postalCode2Re = new RegExp(cityList[city].postalCodeRegex[1]);
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0];
    return match
      ? match.trim().length === 1
        ? `7500${match.trim()}`
        : `750${match.trim()}`
      : null;
  }
}

export class LyonPostalCodeDigger extends DefaultPostalCodeDigger {
  protected digForPostalCode2(city: string, text: string): string {
    const postalCode2Re =
      city === "lyon" && new RegExp(cityList[city].postalCodeRegex[1]);
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0];
    return match
      ? match.trim().length === 1
        ? `6900${match.trim()}`
        : `690${match.trim()}`
      : null;
  }
}

export class LillePostalCodeDigger extends DefaultPostalCodeDigger {}

export class PlaineCommunePostalCodeDigger extends DefaultPostalCodeDigger {}
