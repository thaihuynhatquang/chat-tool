import { Router } from 'express'
import startChannels from 'core/startChannels'

const router = new Router()

router.get('/', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.WEBHOOK_FB_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge'])
  } else {
    res.sendStatus(403)
  }
})

router.post('/', async (req, res) => {
  const { body: data } = req
  if (data.object !== 'page') return

  const channels = await startChannels()

  // Iterate over each entry. There may be multiple if batched.
  data.entry.forEach((entry) => {
    // Iterate over each messaging event
    const { id: pageId } = entry
    const channel = channels['messenger'][pageId]
    if (!channel) return
    const emitMessage = (data, type) => channel.onMessage({ ...data, type })

    entry.messaging.forEach((event) => {
      event.pageId = pageId
      if (event.message && event.message.text) {
        emitMessage(event, 'message')
      } else if (event.message && event.message.attachments) {
        emitMessage(event, 'attachment')
      } else if (event.postback) {
        // TODO: Handle messenger postback
      } else if (event.delivery) {
        // TODO: Handle messenger delivery
      } else if (event.read) {
        // TODO: Handle messenger read
      } else if (event.account_linking) {
        // TODO: Handle messenger account linking
      } else if (event.referral) {
        // TODO: Handle messenger referral
      } else {
        console.log('Webhook received unknown event: ', event)
      }
    })
  })

  res.sendStatus(200)
})

export default router
