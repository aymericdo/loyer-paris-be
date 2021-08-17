import { Request, Response, NextFunction } from 'express'
import * as log from '@helpers/log'
import { ParisAddress } from '@db/db'

export function getAddresses(req: Request, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getAddresses`, 'blue')
  const city = req.params.city
  const addressQuery = req.query.q

  console.log(addressQuery)

  ParisAddress.findOne({
    recordid: 'b4079fbe1a1e44b42747df468a26fbbd3a155998',
  }).then((data) => {
    console.log(data)
  })

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

  res.json('tamere')
}
