import * as rentService from '@db/rent.service'
import { Slack } from '@messenger/slack'
import { FUNNIEST_WEBSITES, WEBSITE_LIST } from '@services/websites/website'

export class HealthCheck {
  async call() {
    const countByWebsite = await rentService.getCountByWebsite()

    let message = 'Voici un petit récap du nombre d\'annonces sauvergardées par site aujourd\'hui :\n'

    const iterableWebsite = WEBSITE_LIST.filter((website) => {
      return !FUNNIEST_WEBSITES.includes(website)
    })

    iterableWebsite.forEach((website, index) => {
      if (!Object.prototype.hasOwnProperty.call(countByWebsite, website)) {
        countByWebsite[website] = 0
      }

      if (index === iterableWebsite.length - 1) {
        message += `${website}: ${countByWebsite[website]}`
      } else {
        message += `${website}: ${countByWebsite[website]}, \n`
      }
    })

    new Slack().sendMessage('#health-check', message)
  }
}
