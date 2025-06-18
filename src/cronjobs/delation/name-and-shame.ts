import { AvailableMainCities } from '@services/city-config/main-cities'
import { getShamefulAdsData } from '@services/db/queries/get-shameful-ads'
import { PrettyLog } from '@services/helpers/pretty-log'
import TwitterApi from 'twitter-api-v2'

type CityInfo = [AvailableMainCities, string, string]

const MAX_DELTA = 150
export class NameAndShameService {
  twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  })

  client = this.twitterClient.readWrite
  v1Client = this.client.v1
  v2Client = this.client.v2

  async call() {
    const cities: CityInfo[] = [
      ['paris', 'à Paris', '@Paris'],
      ['lille', 'à Lille', '@prefet59'],
      ['lyon', 'à Lyon', '@prefetrhone'],
      ['bordeaux', 'à Bordeaux', '@PrefAquitaine33'],
      ['montpellier', 'à Montpellier', '@Prefet34'],
      ['paysBasque', 'au Pays Basque', '@Prefet64'],
      ['grenoble', 'à Grenoble', '@Prefet38'],
    ]

    cities.forEach(async ([mainCity, cityValue, prefecture]: CityInfo) => {
      const ads = await getShamefulAdsData(mainCity, MAX_DELTA)

      if (ads.length > 2) {
        let tweetText = `🤖 Info Encadrement ! Dans la semaine qui vient de s'écouler, ${ads.length} annonces ${cityValue} dépassai${ads.length > 1 ? 'en' : ''}t l'encadrement d'au moins ${MAX_DELTA}€ : `
        tweetText += ads
          .filter((ad) => !!ad.url)
          .slice(0, 5)
          .map((ad) => {
            const url = new URL(ad.url)
            return `${url.origin}${url.pathname}`
          })
          .join('\n')
        tweetText += `\ncc ${prefecture}`
        const { data: createdTweet } = await this.v2Client.tweet(tweetText)
        PrettyLog.call(
          `Tweet ${createdTweet.id} : ${createdTweet.text} has been sent !`,
          'blue',
        )
      }
    })
  }
}
