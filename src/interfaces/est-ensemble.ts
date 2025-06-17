import { DISPLAY_CITY_FIELD, DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

// source : http://www.referenceloyer.drihl.ile-de-france.developpement-durable.gouv.fr/est-ensemble/
export interface EstEnsembleDistrictItemProperties {
  ID_BD_Topo: string
  INSEE_COM: string
  CODE_POST: string
  NOM_COM: string
  SIREN_EPCI: string
  Zone: string
  [DISPLAY_ZONE_FIELD]: string
  [DISPLAY_CITY_FIELD]: string
}
