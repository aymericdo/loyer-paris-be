import { LilleAddressItem, LilleDistrictItem, LilleEncadrementItem, LilleStationItem } from "./json-item-lille";
import { ParisAddressItem, ParisDistrictItem, ParisEncadrementItem, ParisStationItem } from "./json-item-paris";

export interface Coordinate {
    lat: number
    lng: number
}

export interface ApiError { error: string, msg: string }

export interface AddressDetails {
    address: string;
    postalCode: string;
    coordinate: Coordinate;
}

export type DistrictItem = LilleDistrictItem | ParisDistrictItem

export type EncadrementItem = LilleEncadrementItem | ParisEncadrementItem

export type AddressItem = LilleAddressItem | ParisAddressItem

export type StationItem = LilleStationItem | ParisStationItem