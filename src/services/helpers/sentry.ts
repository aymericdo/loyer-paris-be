import { captureMessage } from '@sentry/node'

export class SentryService {
  error(message: string) {
    captureMessage(message, 'error')
  }

  warning(message: string) {
    captureMessage(message, 'warning')
  }

  light(message: string) {
    captureMessage(message, 'log')
  }
}
