import { getShamefulAdsData } from '@services/db/queries/get-shameful-ads'
import {
  createInstagramStoryImage,
  setLatestInstagramStoryImage,
} from '@services/instagram-story-image'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { PrettyLog } from '@services/helpers/pretty-log'

const MIN_EXCESS = 100
const TERRITORIES: [AvailableMainCities, string][] = [
  ['paris', 'Paris'],
  ['lille', 'Lille'],
  ['lyon', 'Lyon'],
  ['bordeaux', 'Bordeaux'],
  ['montpellier', 'Montpellier'],
  ['paysBasque', 'Pays Basque'],
  ['grenoble', 'Grenoble'],
]

type StoryCandidate = {
  city: string
  website: string
  observedPrice: number
  maxPrice: number
  excess: number
}

type InstagramApiResponse = {
  id?: string
  status_code?: string
  error?: {
    message?: string
    type?: string
    code?: number
  }
}

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

export const selectHighestExceedingAd = (
  candidates: StoryCandidate[],
): StoryCandidate | undefined =>
  candidates.reduce<StoryCandidate | undefined>(
    (highest, candidate) =>
      candidate.excess > MIN_EXCESS &&
      (!highest || candidate.excess > highest.excess)
        ? candidate
        : highest,
    undefined,
  )

export class NameAndShameStory {
  async call(): Promise<void> {
    const adsByTerritory = await Promise.all(
      TERRITORIES.map(async ([city, label]) => {
        const ads = await getShamefulAdsData(city, MIN_EXCESS)

        return ads.map((ad) => ({
          city: label,
          website: ad.website,
          observedPrice: ad.priceExcludingCharges,
          maxPrice: ad.maxPrice,
          excess: ad.priceExcludingCharges - ad.maxPrice,
        }))
      }),
    )

    const candidate = selectHighestExceedingAd(adsByTerritory.flat())

    if (!candidate) {
      PrettyLog.call(
        `Name and shame story: no ad exceeding ${MIN_EXCESS} € in the last 24 hours`,
        'yellow',
      )
      return
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const instagramUserId = process.env.INSTAGRAM_USER_ID
    const storyImageUrl = process.env.INSTAGRAM_STORY_IMAGE_URL
    const graphApiVersion = process.env.INSTAGRAM_GRAPH_API_VERSION || 'v27.0'

    if (!accessToken || !instagramUserId || !storyImageUrl) {
      throw new Error(
        'Instagram publishing requires INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID, and INSTAGRAM_STORY_IMAGE_URL',
      )
    }

    const parsedStoryImageUrl = new URL(storyImageUrl)
    if (parsedStoryImageUrl.protocol !== 'https:') {
      throw new Error('INSTAGRAM_STORY_IMAGE_URL must use HTTPS')
    }

    const image = await createInstagramStoryImage(candidate)
    setLatestInstagramStoryImage(image)

    const graphBaseUrl = `https://graph.facebook.com/${graphApiVersion}`
    const callInstagramApi = async (
      path: string,
      method: 'GET' | 'POST',
      params: Record<string, string>,
    ): Promise<InstagramApiResponse> => {
      const url = new URL(`${graphBaseUrl}/${path}`)
      const requestOptions: RequestInit = {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }

      if (method === 'GET') {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value)
        })
      } else {
        requestOptions.headers = {
          ...requestOptions.headers,
          'Content-Type': 'application/json',
        }
        requestOptions.body = JSON.stringify(params)
      }

      const response = await fetch(url, requestOptions)
      const result = (await response.json()) as InstagramApiResponse

      if (!response.ok || result.error) {
        const details = result.error?.message ?? response.statusText
        throw new Error(`Instagram Graph API request failed: ${details}`)
      }

      return result
    }

    const container = await callInstagramApi(
      `${instagramUserId}/media`,
      'POST',
      {
        image_url: storyImageUrl,
        media_type: 'STORIES',
      },
    )

    if (!container.id) {
      throw new Error('Instagram Graph API did not return a media container ID')
    }

    let containerReady = false
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const status = await callInstagramApi(container.id, 'GET', {
        fields: 'status_code',
      })

      if (status.status_code === 'FINISHED') {
        containerReady = true
        break
      }

      if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
        throw new Error(
          `Instagram media container processing failed: ${status.status_code}`,
        )
      }

      await wait(2000)
    }

    if (!containerReady) {
      throw new Error('Instagram media container did not finish processing')
    }

    const publishedMedia = await callInstagramApi(
      `${instagramUserId}/media_publish`,
      'POST',
      {
        creation_id: container.id,
      },
    )

    if (!publishedMedia.id) {
      throw new Error('Instagram Graph API did not return a published media ID')
    }
  }
}
