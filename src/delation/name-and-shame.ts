import TwitterApi from 'twitter-api-v2'

export class NameAndShameService {
  twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN)
  roClient = this.twitterClient.readOnly

  constructor() {}

  async send() {
    // user = await this.roClient.v2.userByUsername('_encadrement')
    // await this.twitterClient.v1.tweet('Hello, this is a test.')
    console.log('Hello, this is a test.')
  }
}
