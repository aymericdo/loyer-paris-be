import { PrettyLog } from '@services/helpers/pretty-log'
import { LogLevel, WebClient } from '@slack/web-api'

export class Slack {
  client = new WebClient(process.env.BOT_USER_OAUTH_TOKEN, {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.ERROR,
  })

  async sendMessage(channel: string, message: string) {
    try {
      // Call the chat.postMessage method using the WebClient
      const result = await this.client.chat.postMessage({
        channel,
        text: message,
      })

      if (process.env.CURRENT_ENV !== 'prod') {
        PrettyLog.call(JSON.stringify(result), 'green')
      }
    } catch (error) {
      console.error(error)
    }
  }
}
