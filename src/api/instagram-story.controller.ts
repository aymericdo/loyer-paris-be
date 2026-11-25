import { getLatestInstagramStoryImage } from '@services/instagram-story-image'
import { NameAndShameStory } from '@cronjobs/instagram/name-and-shame-story'
import { Request, Response, Router } from 'express'

const router = Router()
let isTestRunInProgress = false

const isLoopbackRequest = (req: Request): boolean =>
  ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(
    req.socket.remoteAddress ?? '',
  )

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

router.post('/test-run', async (req: Request, res: Response) => {
  if (process.env.CURRENT_ENV !== 'prod' || !isLoopbackRequest(req)) {
    res.sendStatus(404)
    return
  }

  if (isTestRunInProgress) {
    res
      .status(409)
      .json({ error: 'An Instagram Story test is already running' })
    return
  }

  isTestRunInProgress = true
  try {
    const result = await new NameAndShameStory().call()
    res.status(200).json(result)
  } catch (error) {
    console.error('Instagram Story test run failed', error)
    res.status(500).json({ error: 'Instagram Story test run failed' })
  } finally {
    isTestRunInProgress = false
  }
})

export default router
