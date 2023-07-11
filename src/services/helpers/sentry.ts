import * as Sentry from '@sentry/node'

export class SentryService {
  error(message: string) {
    Sentry.captureMessage(message, 'error')
  }

  warning(message: string) {
    Sentry.captureMessage(message, 'warning')
  }

  light(message: string) {
    Sentry.captureMessage(message, 'log')
  }
}
