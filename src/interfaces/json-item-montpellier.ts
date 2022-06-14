export interface MontpellierDistrictItem {
  type: 'Feature';
  properties: {
    ID_BD_Topo: string;
    INSEE_COM: string;
    CODE_POST: string;
    NOM_COM: string;
    SIREN_EPCI: string;
    Zone: number;
  };
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] };
}

export interface MontpellierEncadrementItem {
  zone: number;
  meuble: boolean;
  nombre_de_piece: string;
  annee_de_construction: string;
  prix_min: string;
  prix_med: string;
  prix_max: string;
}

export interface MontpellierAddress {
  type: 'FeatureCollection';
  name: 'Base_Adresse_Nationale';
  crs: { type: 'name'; properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } };
  features: MontpellierAddressItem[];
}

export interface MontpellierAddressItem {
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
    coordinates: [number, number];
  };
}
