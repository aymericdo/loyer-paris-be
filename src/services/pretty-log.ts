/* eslint no-console: 0 */
import clc from 'cli-color'

export class PrettyLog {
  static call(message: string, color?: string) {
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
}
