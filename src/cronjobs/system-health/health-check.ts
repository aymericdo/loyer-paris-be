import * as rentService from '@db/rent.service'
import { Slack } from '@services/slack/send-message'
import { FUNNIEST_WEBSITES, OLD_WEBSITES, WEBSITE_LIST } from '@websites/website'

export class HealthCheck {
  async call() {
    const countByWebsite = await rentService.getCountByWebsite()

    WEBSITE_LIST.forEach((website) => {
      if (FUNNIEST_WEBSITES.concat(OLD_WEBSITES).includes(website)) return

      if (!Object.prototype.hasOwnProperty.call(countByWebsite, website))
        countByWebsite[website] = 0

      if (countByWebsite[website] < 5) {
        const message = `${countByWebsite[website] > 0 ? 'Seulement' : ''} ${
          countByWebsite[website]
        } annonce${countByWebsite[website] > 1 ? 's' : ''} ${
          countByWebsite[website] > 1 ? 'ont' : 'a'
        } été sauvegardée${
          countByWebsite[website] > 1 ? 's' : ''
        } pour ${website} aujourd'hui.`

        new Slack().sendMessage('#health-check', message)
      }
    })
  }
}
