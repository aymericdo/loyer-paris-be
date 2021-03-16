import * as log from '@helpers/log'
import { ApiError } from '@interfaces/shared'

export enum ErrorCode {
  Other = 'other',
  Minimal = 'minimal',
  Address = 'address',
  City = 'city',
  Price = 'price',
  Filter = 'filter',
  Partner = 'partner',
}

export class ApiErrorsService {
  constructor() {}

  static getStatus(err: ApiError): number {
    log.error(err.msg)
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
