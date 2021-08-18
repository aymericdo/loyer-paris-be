import { Request, Response, NextFunction } from 'express'
import * as log from '@helpers/log'
import { ParisAddress } from '@db/db'

export async function getAddresses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getAddresses`, 'blue')
  const city = req.params.city
  const addressQuery = req.query.q

  console.log(addressQuery)

  const data = await ParisAddress.find({
    'fields.l_adr': new RegExp(addressQuery.toString(), 'i'),
  }).limit(5)

  switch (city) {
    case 'paris':
      console.log('paris')
      break
    case 'lille':
      console.log('lille')
      break
    case 'plaine_commune':
      console.log('plaine_commune')
      break
  }

  res.json(data)
}
