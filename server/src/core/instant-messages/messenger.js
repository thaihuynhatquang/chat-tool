// @flow
import Bootbot from 'bootbot'
import InstantMessage from './interface'
import models from 'models'
import axios from 'axios'
import { nullIfEmptyObj } from 'utils/common'
import { formatTime } from 'utils/time'
import { THREAD_STATUS_UNREAD } from 'constants'
import type { AppType } from 'types/common'
import type { MessengerChannelType } from 'types/channel'
import type { MessengerMessageType, MessageType } from 'types/message'
import type { ThreadType } from 'types/thread'
import type { CustomerType } from 'types/customer'

const { Customer, Thread } = models
const debug = require('debug')('IM:messenger')

/**
 * Messenger Instant Message which listen and send message from messenger.
 *
 * @extends {InstantMessage}
 */
class Messenger extends InstantMessage {
  channel: MessengerChannelType
  accessToken: string
  bot: Bootbot

  /**
   * Constructor for Messenger Instant Message.
   *
   * @param {MessengerChannelType} channel
   * @param {AppType} app For merging webhook routes into application routes
   */
  constructor(channel: MessengerChannelType, app: AppType) {
    super()
    debug(`Init messenger channel ${channel.title}`)
    const {
      configs: { accessToken, verifyToken, appSecret, webhook, broadcastEchoes }
    } = channel
    if (!accessToken || !verifyToken || !appSecret) {
      throw new Error('Require accessToken, verifyToken, appSecret to create Messenger IM')
    }
    this.channel = channel
    this.accessToken = accessToken
    this.bot = new Bootbot({
      accessToken,
      verifyToken,
      appSecret,
      webhook,
      broadcastEchoes
    })
    this.bot.app = app // Using app routes to listen webhook messages
    this.bot._initWebhook()

    // Listen to message and emit event for IM to handle
    // Just support 2 types of event for now
    this.bot.on('message', (payload) => {
      debug(`Receive text message: ${payload.message.text}, at ${payload.timestamp}`)
      this.onMessage({
        ...payload,
        type: 'message'
      })
    })
    this.bot.on('attachment', (payload) => {
      debug(
        `Receive text attachments: ${payload.message.attachments.map((item) => item.type)}, at ${payload.timestamp}`
      )
      this.onMessage({
        ...payload,
        type: 'attachment'
      })
    })
  }

  /**
   * Get message which is formatted into one pre-defined form from Messenger message.
   *
   * @param {MessengerMessageType} message
   * @param {ThreadType} thread
   * @param {CustomerType} customer
   * @return {MessageType}
   */
  getFormattedMessage = (message: MessengerMessageType, thread: ThreadType, customer: CustomerType): MessageType => {
    const {
      message: { mid, text, attachments },
      timestamp
    } = message
    const additionData = nullIfEmptyObj({
      ...(attachments && { attachments })
    })
    const msgCreatedAt = formatTime(timestamp)
    return {
      mid,
      threadId: thread.id,
      customerId: customer.id,
      content: text,
      additionData,
      msgCreatedAt,
      msgUpdatedAt: msgCreatedAt
    }
  }

  /**
   * Find the Thread which input message belongs to. If can not find thread, create one.
   *
   * @param {MessengerMessageType} message
   * @return {ThreadType}
   */
  getOrCreateThreadByMsg = async (message: MessengerMessageType): ThreadType => {
    const {
      sender: { id: uniqueKey },
      message: { mid }
    } = message
    const thread = await Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey }
    })

    if (thread) {
      await thread.update({ lastMsgId: mid })
      return Thread.findOne({
        where: { channelId: this.channel.id, uniqueKey }
      })
    }

    const profile = await this.getUserProfile(uniqueKey)
    return Thread.create({
      channelId: this.channel.id,
      uniqueKey,
      title: profile.name,
      status: THREAD_STATUS_UNREAD,
      lastMsgId: mid
    })
  }

  /**
   * Find the customer own the message. If can not find, create one.
   *
   * @param {MessengerMessageType} message
   * @return {CustomerType}
   */
  getOrCreateCustomerByMsg = async (message: MessengerMessageType): CustomerType => {
    const {
      sender: { id: uniqueKey }
    } = message
    const customer = await Customer.findOne({
      where: { channelId: this.channel.id, uniqueKey }
    })
    if (customer) return customer
    const profile = await this.getUserProfile(uniqueKey)
    return Customer.create({
      channelId: this.channel.id,
      uniqueKey,
      name: profile.name,
      additionData: {
        avatarUrl: profile.profile_pic,
        gender: profile.gender
      }
    })
  }

  /**
   * Send messenger message.
   *
   * @param {MessengerMessageType} message
   */
  sendMessage = async (message: MessengerMessageType) => {
    return true
  }

  /**
   * Get facebook profile from PSID.
   *
   * @param {string} userId User PSID.
   * @return {Object} Facebook profile from PSID.
   */
  getUserProfile = (userId: string) => {
    const url = `https://graph.facebook.com/v3.2/${userId}?fields=name,first_name,last_name,profile_pic,locale,timezone,gender&access_token=${this.accessToken}`
    return axios.get(url).then((res) => res.data)
  }
}

export default Messenger
