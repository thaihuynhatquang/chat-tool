import { Router } from 'express'
import models from 'models'

const router = new Router()
const { Thread, Message, Customer, Sequelize } = models
const Op = Sequelize.Op

router.get('/', async (req, res) => {
  const { channelId, status, title, sort, isMiss, limit, offset } = req.query

  let condition = {}
  let whereCondition = {}

  if (channelId !== undefined) {
    whereCondition = {
      ...whereCondition,
      channelId
    }
  }

  if (status !== undefined) {
    whereCondition = {
      ...whereCondition,
      status
    }
  }

  if (title !== undefined) {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('title')), {
          [Op.like]: '%' + title.toLowerCase() + '%'
        })
      ]
    }
  }

  if (isMiss === 'true') {
    whereCondition = {
      ...whereCondition,
      missCount: {
        [Op.gt]: 0
      }
    }
  }

  let orderCondition = [['updatedAt', 'desc']]
  if (sort !== undefined) {
    orderCondition = []
    const sortCondition = sort.split(',')
    sortCondition.forEach((element) => {
      const temp = element.split(' ')
      orderCondition.push([temp[0], temp[1]])
    })
  }
  condition = {
    raw: true,
    where: whereCondition,
    order: orderCondition,
    limit,
    offset
  }
  const data = await Thread.findAndCountAll(condition)
  let threads = data.rows

  const msgMids = threads.map((thread) => thread.lastMsgId)
  let messages = await Message.findAll({ raw: true, where: { mid: { [Op.in]: msgMids } } })

  const customersIdList = [...new Set(messages.map((msg) => msg.customerId))]
  const customers = await Customer.findAll({ where: { id: { [Op.in]: customersIdList } } })

  messages = messages.map((msg) => {
    return {
      ...msg,
      customer: customers.find((el) => el.id === msg.customerId)
    }
  })

  threads = threads.map((thread) => {
    return {
      ...thread,
      lastMessage: messages.find((el) => el.mid === thread.lastMsgId)
    }
  })

  const result = {
    count: data.count,
    data: threads
  }
  return res.json(result)
})

router.get('/:threadId', async (req, res) => {
  const { threadId } = req.params
  const thread = await Thread.findByPk(threadId)
  return res.json(thread)
})

router.get('/:threadId/user-serving', async (req, res) => {
  const { limit, offset } = req.query
  const thread = await Thread.findByPk(req.params.threadId)
  const countPromise = thread.countUsersServing()
  const usersPromise = thread.getUsersServing({ limit, offset })
  const count = await countPromise
  const usersServing = await usersPromise
  return res.json({ count, data: usersServing })
})

router.get('/:threadId/user-history', async (req, res) => {
  const { limit, offset } = req.query
  const thread = await Thread.findByPk(req.params.threadId)
  const countPromise = thread.countUsersServing()
  const usersPromise = thread.getUsersHistory({ limit, offset })
  const count = await countPromise
  const usersHistory = await usersPromise
  return res.json({ count, data: usersHistory })
})

router.get('/:threadId/customers', async (req, res) => {
  const { limit, offset } = req.query
  const thread = await Thread.findByPk(req.params.threadId)
  const countPromise = thread.countCustomers()
  const customersPromise = thread.getCustomers({ limit, offset })
  const count = await countPromise
  const customers = await customersPromise
  return res.json({ count, data: customers })
})

router.put('/:threadId/status', async (req, res) => {
  const status = req.body.status
  await Thread.update(
    {
      status
    },
    {
      where: { id: req.params.threadId }
    }
  )
  return res.status(200)
})

export default router
