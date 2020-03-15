// @flow
import models from 'models'
import axios from 'axios'
import InstantMessage from './interface'
import Bootbot from 'bootbot'
import { nullIfEmptyObj } from 'utils/common'
import { formatTime } from 'utils/time'
import { THREAD_STATUS_UNREAD } from 'constants'
import type { AppType } from 'types/common'
import type { MessengerChannelType } from 'types/channel'
import type { MessengerMessageType, MessageType } from 'types/message'
import type { ThreadType } from 'types/thread'
import type { CustomerType } from 'types/customer'

const { Customer, Thread } = models
const debug = require('debug')('app:im:messenger')

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
    let {
      configs: { accessToken, verifyToken, appSecret, broadcastEchoes }
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
      broadcastEchoes
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
      sender: { id: senderId },
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
      isVerified: senderId === this.channel.uniqueKey,
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
      sender: { id: senderId },
      recipient: { id: recipientId },
      message: { mid, is_echo: isEcho }
    } = message
    const uniqueKey = isEcho ? recipientId : senderId
    const thread = await Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey }
    })

    if (thread) {
      await thread.update({ lastMsgId: mid })
      const thr = await Thread.findOne({
        where: { channelId: this.channel.id, uniqueKey }
      })
      return { thread: thr, isCreated: false }
    }

    const profile = await this.getUserProfile(uniqueKey)
    const thr = await Thread.create({
      channelId: this.channel.id,
      uniqueKey,
      title: profile.name,
      status: THREAD_STATUS_UNREAD,
      lastMsgId: mid
    })
    return { thread: thr, isCreated: true }
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
    if (customer) return { customer, isCreated: false }
    const profile = await this.getUserProfile(uniqueKey)
    const cus = await Customer.create({
      channelId: this.channel.id,
      uniqueKey,
      name: profile.name,
      additionData: {
        avatarUrl: profile.profile_pic
      }
    })
    return { customer: cus, isCreated: true }
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
    const isChannel = userId === this.channel.uniqueKey
    let query = '?fields=name,profile_pic'
    if (isChannel) query = '/picture?width=720&redirect=0'
    const url = `https://graph.facebook.com/v3.2/${userId}${query}&access_token=${this.accessToken}`
    return axios.get(url).then((res) => {
      let result = res.data
      result = isChannel ? { name: this.channel.title, profile_pic: result.data.url } : result
      return result
    })
  }
}

export default Messenger
