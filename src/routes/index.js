import { Router } from 'express'
import api from 'routes/api'
import webhook from 'routes/webhookMessenger'

const router = new Router()

router.get('/health', async (req, res) => {
  res.send('OK')
})
router.use('/webhook', webhook)

router.use('/api', api)

export default router
