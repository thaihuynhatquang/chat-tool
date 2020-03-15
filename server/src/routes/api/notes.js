import { Router } from 'express'
import models from 'models'

const router = new Router()
const { Note } = models

router.put('/:noteId', async (req, res) => {
  await Note.update(
    {
      content: req.body.content
    },
    {
      where: {
        id: req.params.noteId
      }
    }
  )
  return res.status(200)
})

router.post('/', async (req, res) => {
  const { customerId, content, creator } = req.body
  const customer = await models.Customer.findByPk(customerId)
  await customer.createNote({ content, creator })
  return res.status(200)
})

export default router
