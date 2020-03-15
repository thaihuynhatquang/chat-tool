import { Router } from 'express'
import models from 'models'

const router = new Router()

const { Channel } = models

router.get('/', async (req, res) => {
  const { limit, offset } = req.query
  const channels = await Channel.findAndCountAll({ limit, offset })
  return res.json({ count: channels.count, data: channels.rows })
})

router.get('/:channelId', async (req, res) => {
  const { channelId } = req.params
  const channel = await Channel.findByPk(channelId)
  return res.json(channel)
})

export default router
