import * as log from '@helpers/log'
import { ApiError } from '@interfaces/shared'

export enum ERROR_CODE {
  Other = 'other',
  Minimal = 'minimal',
  Address = 'address',
  City = 'city',
  Price = 'price',
  Surface = 'surface',
  Filter = 'filter',
  Partner = 'partner',
}

export class ApiErrorsService {

  static getStatus(err: ApiError): number {
    switch (err.error as ERROR_CODE) {
      case ERROR_CODE.Minimal:
      case ERROR_CODE.Filter:
      case ERROR_CODE.Partner:
        log.error(err.msg, 'red')
        break
      case ERROR_CODE.City:
        log.light(err.msg)
        break
      default:
        log.warning(err.msg, 'yellow')
        break
    }

    switch (err.error as ERROR_CODE) {
      case ERROR_CODE.Minimal:
      case ERROR_CODE.Address:
      case ERROR_CODE.City:
      case ERROR_CODE.Price:
      case ERROR_CODE.Other:
        return 400
      case ERROR_CODE.Filter:
        return 501
      case ERROR_CODE.Partner:
        return 503
      default:
        return 500
    }
  }
}
