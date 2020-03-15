import { Router } from 'express'
import models from 'models'

const router = new Router()
const { Customer, Tag } = models

router.get('/', async (req, res) => {
  const { limit, offset } = req.query
  const customers = await Customer.findAndCountAll({ limit, offset })
  return res.json({ count: customers.count, data: customers.rows })
})

router.get('/:customerId', async (req, res) => {
  const { customerId } = req.params
  const customer = await Customer.findByPk(customerId)
  return res.json(customer)
})

router.get('/:customerId/tags', async (req, res) => {
  const { limit, offset } = req.query
  const customer = await Customer.findByPk(req.params.customerId)
  const countPromise = customer.countTags()
  const tagsPromise = customer.getTags({ limit, offset })
  const count = await countPromise
  const tags = await tagsPromise
  return res.json({ count, data: tags })
})

router.get('/:customerId/notes', async (req, res) => {
  const { limit, offset } = req.query
  const customer = await Customer.findByPk(req.params.customerId)
  const countPromise = customer.countNotes()
  const notesPromise = customer.getNotes({ limit, offset })
  const count = await countPromise
  const notes = await notesPromise
  return res.json({ count, data: notes })
})

router.put('/:customerId', async (req, res) => {
  const { phone, name } = req.body
  await Customer.update(
    {
      phone,
      name
    },
    {
      where: { id: req.params.customerId }
    }
  )
  return res.status(200)
})

router.post('/:customerId/tag', async (req, res) => {
  const { creator, tagId } = req.body
  const customerPromise = Customer.findByPk(req.params.customerId)
  const tagPromise = Tag.findByPk(tagId)
  const customer = await customerPromise
  const tag = await tagPromise
  await customer.addTag(tag, { through: { creator } })
  return res.status(200)
})

export default router
