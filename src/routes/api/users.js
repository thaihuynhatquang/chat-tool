import { Router } from 'express'
import models from 'models'

const router = new Router()
const { User } = models

router.get('/', async (req, res) => {
  const users = await User.findAndCountAll()
  return res.json({ count: users.count, data: users.rows })
})

router.get('/:userId', async (req, res) => {
  const user = await User.findByPk(req.params.userId)
  return res.json(user)
})

export default router
