const clc = require('cli-color')
const Sentry = require('@sentry/node')

export const info = (message, color) => {
    const date = new Date()
    const log = `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}] ${message}`
    if (color === 'red') {
        console.log(clc.redBright(log))
    } else if (color === 'blue') {
        console.log(clc.blueBright(log))
    } else if (color === 'green') {
        console.log(clc.greenBright(log))
    } else {
        console.log(log)
    }
}

export const error = (message, color) => {
    info(message, color)
    Sentry.captureMessage(message)
}

export const apiHit = (isStats) => {
    const message = `api hit ${isStats ? 'stats' : 'extension'}`
    Sentry.captureMessage(message, 'info')
}
