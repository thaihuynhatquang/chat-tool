import { Router } from 'express'
import models from 'models'

const router = new Router()

const { Tag } = models

router.get('/', async (req, res) => {
  const { limit, offset } = req.query
  const tags = await Tag.findAndCountAll({ limit, offset })
  return res.json({ count: tags.count, data: tags.rows })
})

router.get('/:tagId', async (req, res) => {
  const tag = await Tag.findByPk(req.params.tagId)
  return res.json(tag)
})

router.get('/:tagId/customers', async (req, res) => {
  const { limit, offset } = req.query
  const tag = await Tag.findByPk(req.params.tagId)
  const countPromise = tag.countCustomers()
  const customersPromise = tag.getCustomers({ limit, offset })
  const count = await countPromise
  const customers = await customersPromise

  return res.json({ count, data: customers })
})

router.post('/', async (req, res) => {
  const { content, color, creator } = req.body
  const tag = await Tag.create({
    content,
    color,
    creator
  })
  return res.status(200).json(tag)
})

router.delete('/:tagId', async (req, res) => {
  await Tag.destroy({ where: { id: req.params.tagId } })
  return res.status(200)
})

export default router
