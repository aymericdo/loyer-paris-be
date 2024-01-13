import * as rentService from '@db/rent.service'
import TwitterApi from 'twitter-api-v2'

const MAX_DELTA = 200
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
    [
      // ['paris', 'Paris', '@Paris'],
      // ['plaineCommune', 'Plaine Commune', '@prefpolice'],
      // ['lille', 'Lille', '@prefet59'],
      // ['lyon', 'Lyon', '@prefetrhone'],
      // ['estEnsemble', 'Est Ensemble', '@prefpolice'],
      // ['bordeaux', 'Bordeaux', '@PrefAquitaine33'],
      ['montpellier', 'Montpellier', '@Prefet34'],
    ].forEach(async ([city, cityValue, prefecture]) => {
      const ads = await rentService.getShamefulAdsData(city, MAX_DELTA)

      if (ads.length) {
        let tweetText = `🤖 Info Encadrement ! Dans la semaine qui vient de s'écouler, ${ads.length} annonce${
          ads.length > 1 ? 's' : ''
        } à ${cityValue} dépassai${ads.length > 1 ? 'en' : ''}t l'encadrement d'au moins ${MAX_DELTA}€ : `
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
        // eslint-disable-next-line no-console
        console.log('Tweet', createdTweet.id, ':', createdTweet.text, 'has been sent !')
      }
    })
  }
}
