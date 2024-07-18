import { Slack } from '@messenger/slack'
import { getAdsOfTodayByWebsite } from '@services/db/queries/get-ads-of-today-by-website'
import { FUNNIEST_WEBSITES, WEBSITE_LIST } from '@services/websites/website'

export class HealthCheck {
  async call() {
    const data: {
      website: string, count: number
    }[] = await getAdsOfTodayByWebsite()

    const countByWebsite = data.reduce((prev, obj) => {
      prev[obj.website] = obj.count
      return prev
    }, {})

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
