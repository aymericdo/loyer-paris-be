import { WebClient } from '@slack/web-api'

export class Slack {
  web = new WebClient(process.env.SLACK_TOKEN)

  async sendMessage(channel: string, message: string) {
    (async () => {
      try {
        await this.web.chat.postMessage({
          channel,
          text: message,
        })
        console.log('Message posted!')
      } catch (error) {
        console.log(error)
      }
    
    })()
  }
}
