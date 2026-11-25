import sharp from 'sharp'
import { createInstagramStoryImage } from '../instagram-story-image'

describe('createInstagramStoryImage', () => {
  it('creates a 1080x1920 JPEG with the story prices', async () => {
    const image = await createInstagramStoryImage({
      city: 'Paris',
      website: 'leboncoin',
      maxPrice: 900,
      observedPrice: 1050,
    })
    const metadata = await sharp(image).metadata()

    expect(metadata.format).toBe('jpeg')
    expect(metadata.width).toBe(1080)
    expect(metadata.height).toBe(1920)
  })
})
