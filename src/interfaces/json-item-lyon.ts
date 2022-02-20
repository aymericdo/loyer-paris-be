export interface LyonDistrictItems {
  type: 'FeatureCollection';
  name: 'car_care.carencadrmtloyer_latest';
  features: LyonAddressItem[];
}

export interface LyonAddressItem {
  type: 'Feature';
  properties: {
    codeiris: string;
    zonage: string;
    insee: string;
    valeurs: {
      '1': RoomCountItem;
      '2': RoomCountItem;
      '3': RoomCountItem;
      '4 et plus': RoomCountItem;
    };
    commune: string;
    gid: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
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
