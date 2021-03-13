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
  type: string
  id: number
  lat: number
  lon: number
  nodes: number[]
  tags: {
    city: string
    postcode: string,
    address: string
  }
}
` Generated with this request on https://overpass-turbo.eu/
[out:json];
(
  node["addr:street"]({{geocodeBbox:Lille}});
  way["addr:street"]({{geocodeBbox:Lille}});
  relation["addr:street"]({{geocodeBbox:Lille}});
);
out body;
>;
out skel qt;
`