import { IncompleteRent } from '@db/db'
import { IncompleteAd } from '@interfaces/ad'
import { ApiError } from '@interfaces/shared'
import { Slack } from '@messenger/slack'
import { PrettyLog } from '@services/helpers/pretty-log'

export enum ERROR_CODE {
  Other = 'other',
  Minimal = 'minimal',
  Address = 'address',
  BadLocation = 'badLocation',
  Colocation = 'colocation',
  Price = 'price',
  Surface = 'surface',
  Filter = 'filter',
}

export const ERROR500_MSG = '[ERROR 500]'

export class ApiErrorsService {
  error: ApiError = null
  incompleteAd: IncompleteAd = null
  status: number = null

  constructor(error: ApiError) {
    this.error = error
    this.incompleteAd = error?.incompleteAd
    this.status = this.getStatus(error)
  }

  logger(): void {
    switch (this.error?.error as ERROR_CODE) {
      case ERROR_CODE.Filter:
        PrettyLog.call(this.error.msg, 'red'); break
      case ERROR_CODE.BadLocation:
      case ERROR_CODE.Colocation:
      case ERROR_CODE.Minimal:
      case ERROR_CODE.Other:
      case ERROR_CODE.Address:
      case ERROR_CODE.Price:
      case ERROR_CODE.Surface:
        PrettyLog.call(this.error.msg, 'yellow'); break
      default: {
        const errorMsg = `${ERROR500_MSG} ${this.error?.stack}`
        PrettyLog.call(errorMsg, 'red')
      }
    }
  }

  async sendSlackErrorMessage(sentryId?: string): Promise<void> {
    if (this.error?.error === ERROR_CODE.BadLocation) {
      new Slack().sendMessage('#bad-location', `${this.incompleteAd?.website} : ${this.error.msg}`)
    }

    if (this.status >= 500) {
      const basicError: Error = this.error as unknown as Error

      new Slack().sendMessage('#errors',
        `Error ${this.status} : ${basicError.name}: ${basicError.message}\n${basicError.stack}\n`+
        `(https://encadrement-loyers.sentry.io/issues/?query=${sentryId})`
      )
    }
  }

  async saveIncompleteRent() {
    if (!(this.error?.isIncompleteAd && this.incompleteAd)) return

    const incompleteRent = new IncompleteRent({
      id: this.incompleteAd.id,
      url: this.incompleteAd.url,
      website: this.incompleteAd.website,
      errorType: this.error.error,
      errorMessage: this.error.msg,
      ...(this.incompleteAd.city != null && { city: this.incompleteAd.city }),
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

  private getStatus(error: ApiError): number {
    switch (error?.error as ERROR_CODE) {
      case ERROR_CODE.Minimal:
      case ERROR_CODE.Address:
      case ERROR_CODE.BadLocation:
      case ERROR_CODE.Colocation:
      case ERROR_CODE.Price:
      case ERROR_CODE.Surface:
      case ERROR_CODE.Other:
        return 400
      case ERROR_CODE.Filter:
        return 422
      default:
        return 500
    }
  }
}
