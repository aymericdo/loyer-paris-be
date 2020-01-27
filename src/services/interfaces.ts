export interface AddressInfo {
    postalCode: string;
    city?: string;
}
export interface Coordinate {
    lat: string;
    lng: string;
}

export interface Ad {
    id: number
    address?: string
    charges?: number
    cityLabel?: string
    coord?: Coordinate
    description: string
    furnished?: boolean
    hasCharges?: boolean
    neighborhood?: string
    postalCode?: string
    price: number
    renter?: string
    rooms?: number
    stations?: string[]
    surface: number
    title?: string
    yearBuilt?: number
}

export interface DetectedInfo {
    coordinates: Coordinate
    hasFurniture: boolean
    postalCode: string
    roomCount: number
    stations: string[]
    yearBuilt: number[]
}

export interface AddressItem {
    datasetid: string
    recordid: string
    fields: {
        n_sq_ad: number
        l_adr: string
        a_nvoie: number
        objectid: number
        c_suf2: string
        n_sq_vo: number
        l_nvoie: string
        b_offstdf: string
        geom_x_y: number[]
        geom: {
            type: string
            coordinates: number[][][]
        }
        n_sq_ar: number
        b_hors75: string
        b_angle: string
        n_voie: number
        c_ar: number
    }
    geometry: {
        type: string
        coordinates: number[][][]
    }
    record_timestamp: string
}

export interface DistrictItem {
    datasetid: string
    recordid: string
    fields: {
        n_sq_qu: number
        perimetre: string
        geom_x_y: number[]
        c_qu: number
        surface: number
        l_qu: string
        geom: {
            type: string
            coordinates: number[][][]
        }
        n_sq_ar: number
        c_quinsee: number
        c_ar: number
    }
    geometry: {
        type: string
        coordinates: number[][][]
    }
    record_timestamp: string
}

export interface EncadrementItem {
    datasetid: string
    recordid: string
    fields: {
        ville: string
        epoque: string
        id_zone: number
        meuble_txt: string
        max: number
        min: number
        geo_point_2d: number[]
        nom_quartier: string
        geo_shape: {
            type: string
            coordinates: number[][][]
        }
        id_quartier: number
        piece: number
        ref: number
        annee: number
        code_grand_quartier: number
    }
    geometry: {
        type: string
        coordinates: number[]
    }
    record_timestamp: string
}

export interface MetroItem {
    type: string
    id: number
    lat: number
    lon: number
    tags: {
        "STIF:zone": string
        alt_name: string
        layer: string
        name: string
        "name:ru": string
        public_transport: string
        railway: string
        "ref:FR:RATP": string
        "ref:FR:STIF": string
        source: string
        subway: string
        "type:RATP": string
        wheelchair: string
        wikidata: string
        wikipedia: string
    }
}

export interface SavedInfo {
    id: number
    address: string
    city: string
    hasFurniture: boolean
    isLegal: boolean
    latitude: string
    longitude: string
    maxPrice: number
    postalCode: string
    price: number
    priceExcludingCharges: number
    renter: string
    roomCount: number
    stations: string[]
    surface: number
    website: string
    yearBuilt: number[]
}

export interface SerializedInfo {
    address: string
    charges: number
    hasCharges: boolean
    hasFurniture: boolean
    isLegal: boolean
    maxAuthorized: number
    postalCode: string
    price: number
    priceExcludingCharges: number
    roomCount: number
    surface: number
    yearBuilt: number[]
}

export interface FacebookMapping {
    id: number
    address: string
    cityLabel: string
    description: string
    furnished: boolean
    price: string
    renter: string
    rooms: string
    surface: string
    title: string
}

export interface LeboncoinMapping {
    id: number
    cityLabel: string
    body: string
    furnished: string
    hasCharges: string
    price: string
    renter: string
    rooms: string
    surface: string
    subject: string
}

export interface LeboncoinAPIMapping {
    id: number
    list_id: number
    subject: string
    body: string
    price: string[]
    attributes: { [detail: string]: string; }[]
    location: {
        lng: string
        lat: string
        city: string
        zipcode: string
    }
}

export interface LefigaroMapping {
    id: number
    charges: string
    cityLabel: string
    description: string
    furnished: boolean
    hasCharges: boolean
    price: string
    renter: string
    rooms: string
    surface: string
    title: string
}

export interface LogicimmoMapping {
    id: number
    charges: string
    cityLabel: string
    description: string
    furnished: string
    hasCharges: boolean
    price: string
    renter: string
    rooms: string
    surface: string
    title: string
}

export interface LoueragileMapping {
    yearBuilt: number
    ad: {
        id: number
        city: string
        lng: string
        lat: string
        description: string
        furnished: boolean
        postal_code: string
        rent: number
        owner_type: string
        source: string
        room: number
        area: number
        title: string
        stops: {
            name: string
        }[]
    }
}

export interface OrpiMapping {
    id: number
    charges: string
    cityLabel: string
    coord: Coordinate
    description: string
    furnished: boolean
    hasCharges: boolean
    price: number
    postalCode: string
    renter: string
    rooms: number
    surface: number
    title: string
    yearBuilt: number
}

export interface PapMapping {
    id: number
    cityLabel: string
    description: string
    price: string
    postalCode: string
    renter: string
    rooms: string
    surface: string
    title: string
    stations: string[]
}

export interface SelogerAPIMapping {
    idAnnonce: number
    adresse: string
    ville: string
    descriptif: string
    furnished: boolean
    permaLien: string
    prix: string
    cp: string
    contact: {
        nom: string
    }
    nbPieces: number
    details: {
        detail: { [detail: string]: string; }[]
    }
    titre: string
}

export interface SelogerMapping {
    id: number
    charges: string
    cityLabel: string
    description: string
    furnished: boolean
    hasCharges: boolean
    price: string
    postalCode: string
    renter: string
    rooms: string
    surface: string
    title: string
}