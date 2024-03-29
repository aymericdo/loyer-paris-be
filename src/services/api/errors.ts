import { IncompleteRent } from '@db/db'
import { ApiError } from '@interfaces/shared'
import { PrettyLog } from '@services/helpers/pretty-log'
import { SentryService } from '@services/helpers/sentry'

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

export const ERROR500_MSG = '[ERROR 500]'

export class ApiErrorsService {
  error: ApiError = null

  constructor(error: ApiError) {
    this.error = error
  }

  getStatus(needLog = true): number {
    if (needLog) {
      switch (this.error?.error as ERROR_CODE) {
        case ERROR_CODE.Filter:
          PrettyLog.call(this.error.msg, 'red')
          break
        case ERROR_CODE.Partner:
        case ERROR_CODE.City:
          PrettyLog.call(this.error.msg)
          break
        case ERROR_CODE.Minimal:
        case ERROR_CODE.Other:
        case ERROR_CODE.Address:
        case ERROR_CODE.Price:
        case ERROR_CODE.Surface:
          PrettyLog.call(this.error.msg, 'yellow')
          break
        default: {
          const errorMsg = `${ERROR500_MSG} ${this.error?.stack || this.error}`
          PrettyLog.call(errorMsg, 'red')
          new SentryService().error(errorMsg)
          break
        }
      }

      if (this.error?.isIncompleteAd) {
        this.saveIncompleteRent()
      }
    }

    switch (this.error?.error as ERROR_CODE) {
      case ERROR_CODE.Minimal:
      case ERROR_CODE.Address:
      case ERROR_CODE.City:
      case ERROR_CODE.Price:
      case ERROR_CODE.Surface:
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

  async saveIncompleteRent() {
    const ad = this.error.incompleteAd
    if (!ad) return

    const incompleteRent = new IncompleteRent({
      id: ad.id,
      url: ad.url,
      website: ad.website,
      errorType: this.error.error,
      errorMessage: this.error.msg,
      ...(ad.city != null && { city: ad.city }),
    })

    try {
      await incompleteRent.save()
      PrettyLog.call('incomplete ad saved', 'green')
    } catch (err) {
      if (err.code === 11000) {
        PrettyLog.call('⚠️  incomplete ad already saved', 'red')
      } else {
        console.error(err)
      }
    }
  }
}
