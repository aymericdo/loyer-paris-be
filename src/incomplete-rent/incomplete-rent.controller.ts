import express, { Response, Request } from 'express'
import { IncompleteRent } from '@db/db'
import { PrettyLog } from '@services/pretty-log'
const router = express.Router()

router.get('/', getIncompleteAds)
async function getIncompleteAds(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getIncompleteAds`, 'blue')

  try {
    const data = (await IncompleteRent.find() as unknown as {
      id: string
      website: string
      url: string
      city?: string
      createdAt: string
    }[])

    // retourner un graph vega de n courbes ou n correspond au nombre de villes + le 'pas de ville trouvé', au cours du temps

    res.json(data)
  } catch (err) {
    res.status(500).json(err)
  }
}

module.exports = router
