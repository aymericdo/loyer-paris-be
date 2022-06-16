import * as Sentry from '@sentry/node'
import { Severity } from '@sentry/node'

export class SentryService {
  error(message: string) {
    Sentry.captureMessage(message, Severity.Error)
  }

  warning(message: string) {
    Sentry.captureMessage(message, Severity.Warning)
  }

  light(message: string) {
    Sentry.captureMessage(message, Severity.Log)
  }
}
