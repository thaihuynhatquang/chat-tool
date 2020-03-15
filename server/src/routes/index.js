import { Router } from 'express'
import webhook from 'routes/webhook'

const router = new Router()

router.get('/health', async (req, res) => {
  res.send('OK')
})
router.use('/webhook', webhook)

export default router
