import clc from 'cli-color'
import * as Sentry from '@sentry/node'
import { Severity } from '@sentry/node'

export const info = (message: string, color?: string) => {
  const date = new Date()
  const log = `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}] ${message}`
  if (color === 'red') {
    console.log(clc.redBright(log))
  } else if (color === 'blue') {
    console.log(clc.blueBright(log))
  } else if (color === 'green') {
    console.log(clc.greenBright(log))
  } else if (color === 'yellow') {
    console.log(clc.yellowBright(log))
  } else {
    console.log(log)
  }
}

export const error = (message: string, color?: string) => {
  info(message, color)
  Sentry.captureMessage(message, Severity.Error)
}

export const warning = (message: string, color?: string) => {
  info(message, color)
  Sentry.captureMessage(message, Severity.Warning)
}

export const light = (message: string, color?: string) => {
  info(message, color)
  Sentry.captureMessage(message, Severity.Log)
}
