import { Request, Response } from 'express';
import { PrettyLog } from '@services/pretty-log';
import {
  LilleAddress,
  LyonAddress,
  ParisAddress,
  PlaineCommuneAddress,
} from '@db/db';
import { ParisDistrictService } from '@services/filter-rent/paris-district';
import { LilleDistrictService } from '@services/filter-rent/lille-district';
import { PlaineCommuneDistrictService } from '@services/filter-rent/plaine-commune-district';
import { LyonDistrictService } from '@services/filter-rent/lyon-district';

export async function getAddresses(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getAddresses`, 'blue');
  const city = req.params.city
  const addressQuery = req.query.q

  if (addressQuery.length < 2) {
    res.json([])
    return;
  }

  let data = []

  switch (city) {
    case 'paris':
      data = await ParisAddress.find(
        {
          $text: { $search: addressQuery.toString() },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()

      data = data.map((elem) => {
        const parisDistrictService = new ParisDistrictService(
          this.postalCodeFormat(elem.fields.c_ar.toString()),
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const districts = parisDistrictService.getDistricts()

        return {
          ...elem,
          districtName: districts.length ? districts[0].properties.l_qu : null,
        }
      });
      break
    case 'lille':
      data = await LilleAddress.find(
        {
          $text: { $search: addressQuery.toString() },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()

      data = data.map((elem) => {
        const lilleDistrictService = new LilleDistrictService(
          elem.code_postal,
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const districts = lilleDistrictService.getDistricts()

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero}${elem.rep || ''} ${elem.nom_voie} (${
              elem.code_postal
            })`,
          },
          districtName: districts.length
            ? `Zone ${districts[0].properties.zonage}`
            : null,
        }
      });
      break
    case 'plaine_commune':
      data = await PlaineCommuneAddress.find(
        {
          $text: { $search: addressQuery.toString() },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()

      data = data.map((elem) => {
        const plaineCommuneDistrictService = new PlaineCommuneDistrictService(
          elem.code_postal === '93210' ? '93200' : elem.code_postal, // 93210 is to recent I suppose
          {
            lng: elem.geometry.coordinates[0],
            lat: elem.geometry.coordinates[1],
          }
        )

        const districts = plaineCommuneDistrictService.getDistricts()

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero}${elem.rep || ''} ${elem.nom_voie} (${
              elem.code_postal
            })`,
          },
          districtName: districts.length
            ? `Zone ${districts[0].properties.Zone}`
            : null,
        }
      });
      break
    case 'lyon':
      data = await LyonAddress.find(
        {
          $text: { $search: addressQuery.toString() },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()

      data = data.map((elem) => {
        const lyonDistrictService = new LyonDistrictService(elem.code_postal, {
          lng: elem.geometry.coordinates[0],
          lat: elem.geometry.coordinates[1],
        })

        const districts = lyonDistrictService.getDistricts()

        return {
          ...elem,
          fields: {
            l_adr: `${elem.numero}${elem.rep || ''} ${elem.nom_voie} (${
              elem.code_postal
            })`,
          },
          districtName: districts.length
            ? `Zone ${districts[0].properties.zonage}`
            : null,
        }
      });
      break
  }

  res.json(data)
}
