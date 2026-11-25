import { getLatestInstagramStoryImage } from '@services/instagram-story-image'
import { Router } from 'express'

const router = Router()

router.get('/latest.jpg', (_req, res) => {
  const image = getLatestInstagramStoryImage()

  if (!image) {
    res.sendStatus(404)
    return
  }

  res.set({
    'Cache-Control': 'no-store',
    'Content-Type': 'image/jpeg',
  })
  res.send(image)
})

export default router
