import * as log from '@helpers/log'
import { ApiError } from '@interfaces/shared'

export enum ErrorCode {
    Minimal = 'minimal',
    Address = 'address',
    City = 'city',
    Price = 'price',
    Filter = 'filter',
    Partner = 'partner',
}

export class ApiErrorsService {
  constructor () {}

  static getStatus(err: ApiError): number {
    log.error(err.msg)
    switch (err.error) {
        case ErrorCode.Minimal, ErrorCode.Address, ErrorCode.City, ErrorCode.Price:
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
