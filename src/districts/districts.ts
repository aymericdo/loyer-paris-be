import { Response, Request } from 'express'
import { PrettyLog } from '@services/pretty-log'
import { DistrictsList } from '@services/districts'

export function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
  const city = req.params.city
  const districtList = new DistrictsList()

  let geodata: any
  switch (city) {
    case 'paris':
      geodata = districtList.parisGeodata()
      break
    case 'lille':
      geodata = districtList.lilleGeodata()
      break
    case 'plaine_commune':
      geodata = districtList.plaineCommuneGeodata()
      break
    case 'est_ensemble':
      geodata = districtList.estEnsembleGeodata()
      break
    case 'lyon':
      geodata = districtList.lyonGeodata()
      break
    case 'montpellier':
      geodata = districtList.montpellierGeodata()
      break
  }

  interface DistrictElem {
    value: string;
    groupBy: string | null;
    displaySequence: number;
  }

  res.json(
    geodata.features
      .reduce((prev: DistrictElem[], data) => {
        switch (city) {
          case 'paris': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === data['properties']['l_qu']
              )
            ) {
              prev.push({
                value: data['properties']['l_qu'],
                displaySequence: data['properties']['c_ar'],
                groupBy: `${data['properties']['c_ar']}${(data['properties'][
                  'c_ar'
                ] > 1
                  ? 'ème'
                  : 'er'
                ).toString()} arrondissement`,
              })
            }
            break
          }
          case 'lille': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['zonage']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['zonage']}`,
                displaySequence: data['properties']['zonage'],
                groupBy: null,
              })
            }
            break
          }
          case 'plaine_commune': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['Zone']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['Zone']}`,
                displaySequence: data['properties']['Zone'],
                groupBy: null,
              })
            }
            break
          }
          case 'lyon': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['zonage']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['zonage']}`,
                displaySequence: data['properties']['zonage'],
                groupBy: null,
              })
            }
            break
          }
          case 'est_ensemble': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['Zone']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['Zone']}`,
                displaySequence: data['properties']['Zone'],
                groupBy: null,
              })
            }
            break
          }
          case 'montpellier': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['Zone']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['Zone']}`,
                displaySequence: data['properties']['Zone'],
                groupBy: null,
              })
            }
            break
          }
        }

        return prev
      }, [])
      .sort((a: DistrictElem, b: DistrictElem) => {
        return a.displaySequence > b.displaySequence ? 1 : -1
      })
  )
}
