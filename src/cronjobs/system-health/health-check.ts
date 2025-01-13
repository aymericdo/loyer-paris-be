import { Slack } from '@messenger/slack'
import { getAdsOfTodayByWebsite, getAdsOfWeekByWebsite } from '@services/db/queries/get-ads-of-today-by-website'
import { FUNNIEST_WEBSITES, WEBSITE_LIST } from '@services/websites/website'

export class HealthCheck {
  async call() {
    const adsOfToday: {
      website: string, count: number
    }[] = await getAdsOfTodayByWebsite()

    const adsOfWeek: {
      website: string, count: number
    }[] = await getAdsOfWeekByWebsite()

    const websitesWithoutResultSinceOneWeek = WEBSITE_LIST.filter((website) => {
      return !FUNNIEST_WEBSITES.includes(website) && !adsOfWeek.some((value) => value.website === website)
    })

    const countByWebsite = adsOfToday.reduce((prev, obj) => {
      prev[obj.website] = obj.count
      return prev
    }, {})

    let message = 'Voici un petit récap du nombre d\'annonces sauvergardées par site aujourd\'hui :\n'

    const iterableWebsite = Object.keys(countByWebsite)

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

    if (websitesWithoutResultSinceOneWeek.length) {
      message += `\n*${websitesWithoutResultSinceOneWeek.join(', ')} sont des sites qui semblent en panne.*`
    }

    new Slack().sendMessage('#health-check', message)
  }
}
