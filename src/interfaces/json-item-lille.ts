export interface LilleDistrictItem {
  type: "Feature";
  geometry: {
    type: "Polygon"
    coordinates: number[][][]
  };
  properties: {
    zonage: number,
    geo_point_2d: [number, number];
  };
}

export interface LilleEncadrementItem {
  datasetid: string
  recordid: string
  fields: {
    majoration_unitaire_du_loyer_de_reference_meublees: number
    zone: number
    loyer_de_reference_non_meublees: number
    loyer_de_reference_meublees: number
    loyer_de_reference_minore_non_meublees: number
    loyer_de_reference_minore_meublees: number
    loyer_de_reference_majore_non_meublees: number
    loyer_de_reference_majore_meublees: string
    epoque_construction: string
    nb_pieces: string
  }
  record_timestamp: string
}

export interface LilleAddressItem {
  datasetid: string
  recordid: string
  fields: {
    auto_adres: string
    ccomvoi: number
    insee: number
    rivoli_id: number
    cpostal: number
    objectid: number
    auto_match: string
    nomcom: string
    geo_point_2d: [number, number]
    numero: number
    typevoie: string
    geo_shape: {
      type: string,
      coordinates: [number, number]
    },
    comm_id: string
    nomvoie: string
  },
  geometry: {
    type: string,
    coordinates: [number, number]
  },
  record_timestamp: string
}

export interface LilleStationItem {
  datasetid: string
  recordid: string
  fields: {
    wheelchair_boarding: string
    zone_id: string
    stop_id: string
    parent_station: string
    stop_coordinates: number[]
    stop_desc: string
    stop_name: string
    location_type: string
  }
  geometry: {
    type: string
    coordinates: number[]
  }
  record_timestamp: string
}