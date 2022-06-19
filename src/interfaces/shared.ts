import { IncompleteAd } from '@interfaces/ad'
import { EstEnsembleEncadrementItem } from './json-item-est-ensemble'
import { LilleDistrictItem, LilleEncadrementItem } from './json-item-lille'
import { LyonAddressItem } from './json-item-lyon'
import { MontpellierEncadrementItem } from './json-item-montpellier'
import { ParisDistrictItem, ParisEncadrementItem } from './json-item-paris'
import { PlaineCommuneEncadrementItem } from './json-item-plaine-commune'

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface ApiError {
  error: string;
  msg: string;
  isIncompleteAd?: boolean;
  incompleteAd?: IncompleteAd;
}

export interface AddressItem {
  address: string;
  postalCode: string;
  coordinate: Coordinate;
}

export interface DefaultAddress {
  type: 'FeatureCollection';
  name: 'Base_Adresse_Nationale';
  crs: { type: 'name'; properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } };
  features: DefaultAddressItem[];
}

export interface DefaultAddressItem {
  type: 'Feature';
  properties: {
    id: string;
    id_fantoir: any;
    numero: number;
    rep: any;
    nom_voie: string;
    code_posta: number;
    code_insee: number;
    nom_commun: string;
    code_ins_1: string;
    nom_ancien: string;
    x: number;
    y: number;
    lon: number;
    lat: number;
    alias: string;
    nom_ld: string;
    libelle_ac: string;
    nom_afnor: string;
    source_pos: string;
    source_nom: string;
  };
  geometry: {
    type: 'Point';
    coordinates: ReadonlyArray<ReadonlyArray<number>>;
  };
}

export interface DefaultDistrictItem {
  type: 'Feature';
  properties: {
    ID_BD_Topo: string;
    INSEE_COM: string;
    CODE_POST: string;
    NOM_COM: string;
    SIREN_EPCI: string;
    Zone: string;
  };
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] };
}

export type Address = DefaultAddress | { features: ParisDistrictItem[] } | { features: LilleDistrictItem[] } | { features: LyonAddressItem[] }

export type DistrictItem = DefaultDistrictItem | LilleDistrictItem | LyonAddressItem | ParisDistrictItem

export type EncadrementItem =
  ParisEncadrementItem |
  EstEnsembleEncadrementItem |
  PlaineCommuneEncadrementItem |
  LyonAddressItem |
  LilleEncadrementItem |
  MontpellierEncadrementItem