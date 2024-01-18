import { captureMessage, Severity } from '@sentry/node'

export class SentryService {
  error(message: string) {
    captureMessage(message, Severity.Error)
  }

  warning(message: string) {
    captureMessage(message, Severity.Warning)
  }

  light(message: string) {
    captureMessage(message, Severity.Log)
  }
}
