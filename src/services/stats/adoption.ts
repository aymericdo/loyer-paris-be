import { getAllWithoutFilterData } from '@services/db/queries/get-all-without-filter'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export async function getAdoptionRate(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} adoption`, 'blue')

  const data = await getAllWithoutFilterData()
  const vegaMap = {
    ...Vega.commonOpt(),
    data: {
      values: data,
    },
    mark: { type: 'line', tooltip: true, interpolate: 'monotone' },
    transform: [
      {
        sort: [{ field: 'createdAt' }],
        window: [{ op: 'count', field: 'count', as: 'cumulative_count' }],
        frame: [null, 0],
      },
    ],
    encoding: {
      x: {
        field: 'createdAt',
        title: 'Date',
        type: 'temporal',
        timeUnit: 'yearmonthdate',
      },
      y: {
        field: 'cumulative_count',
        title: 'Nombre d\'annonces',
        type: 'quantitative',
      },
    },
  }
  vegaMap.config['mark'] = { color: '#FBC652' }

  res.json(vegaMap)
}
