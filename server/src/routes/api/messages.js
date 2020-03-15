import { Router } from 'express'
import models from 'models'

const router = new Router()
const { Message, Customer, Sequelize } = models
const Op = Sequelize.Op

router.get('/', async (req, res) => {
  const { threadId, limit, offset } = req.query
  const messages = await Message.findAndCountAll({ raw: true, where: { threadId }, limit, offset })

  const customersIdList = [...new Set(messages.rows.map((msg) => msg.customerId))]

  const customers = await Customer.findAll({ where: { id: { [Op.in]: customersIdList } } })

  const data = messages.rows.map((msg) => {
    return {
      ...msg,
      customer: customers.find((el) => el.id === msg.customerId)
    }
  })
  return res.json({ count: messages.count, data })
})

export default router
