import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface LilleEncadrementItem {
  datasetid: string;
  recordid: string;
  fields: {
    majoration_unitaire_du_loyer_de_reference_meublees: number;
    zone: number;
    loyer_de_reference_non_meublees: number;
    loyer_de_reference_meublees: number;
    loyer_de_reference_minore_non_meublees: number;
    loyer_de_reference_minore_meublees: number;
    loyer_de_reference_majore_non_meublees: number;
    loyer_de_reference_majore_meublees: string;
    epoque_construction: string;
    nb_pieces: string;
  };
  record_timestamp: string;
}

export interface LilleDistrictItem {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    zonage: number;
    geo_point_2d: [number, number];
    [DISPLAY_ZONE_FIELD]: string;
  };
}
