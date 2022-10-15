import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface LyonEncadrementItem {
  zonage: string;
  valeurs: {
    '1': RoomCountItem;
    '2': RoomCountItem;
    '3': RoomCountItem;
    '4 et plus': RoomCountItem;
  };
}

export interface RoomCountItem {
  '1946-70': {
    meuble: UnitItem;
    'non meuble': UnitItem;
  };
  '1971-90': {
    meuble: UnitItem;
    'non meuble': UnitItem;
  };
  'avant 1946': {
    meuble: UnitItem;
    'non meuble': UnitItem;
  };
  'après 1946': {
    meuble: UnitItem;
    'non meuble': UnitItem;
  };
}

export interface UnitItem {
  loyer_reference: number;
  majoration_unitaire: number;
  loyer_reference_majore: number;
  loyer_reference_minore: number;
}

export interface UnitItemComplete extends UnitItem {
  zone: string;
  roomCount: string;
  yearBuilt: string;
  isFurnished: string;
}

export interface LyonDistrictItem {
  type: 'Feature';
  properties: {
    zonage: string;
    commune: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface BordeauxDistrictItem {
  type: 'Feature';
  properties: {
    com_code: number;
    zonage: string;
    commune: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}
