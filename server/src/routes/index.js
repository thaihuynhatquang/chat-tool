// @flow
import { Router } from 'express'
import webhookFB from 'routes/webhookFB'
import { loggingRequest } from 'routes/middlewares/logging'

const router = new Router()

router.get('/health', async (req, res) => {
  res.send('OK')
})
router.use('/webhook-fb', webhookFB)

export default router
