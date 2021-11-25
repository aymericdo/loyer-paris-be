import * as log from '@helpers/log'
import { ApiError } from '@interfaces/shared'

export enum ErrorCode {
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
    switch (err.error as ErrorCode) {
      case ErrorCode.Minimal:
      case ErrorCode.Filter:
      case ErrorCode.Partner:
        log.error(err.msg, 'red')
        break
      case ErrorCode.City:
        log.light(err.msg)
        break
      default:
        log.warning(err.msg, 'yellow')
        break
    }

    switch (err.error as ErrorCode) {
      case ErrorCode.Minimal:
      case ErrorCode.Address:
      case ErrorCode.City:
      case ErrorCode.Price:
      case ErrorCode.Other:
        return 400
      case ErrorCode.Filter:
        return 501
      case ErrorCode.Partner:
        return 503
      default:
        return 500
    }
  }
}
