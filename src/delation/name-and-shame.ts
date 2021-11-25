import TwitterApi from 'twitter-api-v2'
import * as rentService from '@db/rent.service'

export class NameAndShameService {
  MAX_DELTA = 200

  twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  })

  client = this.twitterClient.readWrite
  v1Client = this.client.v1
  v2Client = this.client.v2

  async send() {
    ['paris', 'lille', 'lyon'].forEach(async (city) => {
      const ads = await rentService.getShamefulAdsData(city, this.MAX_DELTA)

      if (ads.length) {
        let tweetText = `Info Encadrement ! Dans la semaine qui vient de s'écouler, ${ads.length} annonce${ads.length > 1 ? 's' : ''} concernant la ville de ${city.charAt(0).toUpperCase() + city.slice(1)} dépassai${ads.length > 1 ? 'en' : ''}t l'encadrement d'au moins ${this.MAX_DELTA}€ : `
        tweetText += ads.slice(0, 5).map((ad) => ad.url).join('\n')
        const { data: createdTweet } = await this.v2Client.tweet(tweetText)
        console.log('Tweet', createdTweet.id, ':', createdTweet.text, 'has been sent !')
      }
    })
  }
}
