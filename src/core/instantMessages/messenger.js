import FormData from 'form-data';
import fs from 'fs';
import db from 'models';
import InstantMessage from './interface';
import Bootbot from 'bootbot';
import { nullIfEmptyObj, getRoomName } from 'utils/common';
import { getUserProfileFB, sendMessenger } from 'utils/graph';
import { emitThreadUpdateRead } from 'utils/socket';
import { formatTime } from 'utils/time';
import signature from 'utils/signature';
import * as calculateInferenceField from '../triggers/calculateInferenceField';
import client from 'config/redis';
import { threadsWithLastMessage } from 'utils/db';
import { THREAD_STATUS_UNREAD, CHANNEL_SOCKET_KEY, THREAD_SOCKET_KEY } from 'constants';

const debug = require('debug')('app:im:messenger');

/**
 * Get type of Attachment file
 * @param {Object} file
 * @return {String}
 */
const getAttachmentType = (file) => {
  if (['audio', 'video', 'image'].includes(file.mimetype.split('/')[0])) {
    return file.mimetype.split('/')[0];
  }
  return 'file';
};
/**
 * Messenger Instant Message which listen and send message from messenger.
 *
 * @extends {InstantMessage}
 */
class Messenger extends InstantMessage {
  /**
   * Constructor for Messenger Instant Message.
   *
   * @param {MessengerChannelType} channel
   * @param {AppType} app For merging webhook routes into application routes
   */
  constructor(channel, app) {
    super(channel, app);
    debug(`Init messenger channel ${channel.title}`);
    let {
      configs: { accessToken, verifyToken, appSecret, broadcastEchoes },
    } = channel;
    if (!accessToken || !verifyToken || !appSecret) {
      throw new Error('Require accessToken, verifyToken, appSecret to create Messenger IM');
    }
    this.channel = channel;
    this.accessToken = accessToken;
    this.bot = new Bootbot({
      accessToken,
      verifyToken,
      appSecret,
      broadcastEchoes,
    });
  }

  /**
   * Get message which is formatted into one pre-defined form from Messenger message.
   *
   * @param {MessengerMessageType} message
   * @param {ThreadType} thread
   * @param {CustomerType} customer
   * @return {MessageType}
   */
  getFormattedMessage = async (message, thread, customer) => {
    const {
      message: { mid, text, attachments },
      sender: { id: senderId },
      timestamp,
    } = message;
    const additionData = nullIfEmptyObj({
      ...(attachments && { attachments }),
    });
    const msgCreatedAt = formatTime(timestamp);

    const userId = await client.getAsync(mid);

    return {
      mid,
      threadId: thread.id,
      customerId: customer.id,
      isVerified: senderId === this.channel.uniqueKey,
      content: text,
      userId: userId && parseInt(userId),
      additionData,
      msgCreatedAt,
      msgUpdatedAt: msgCreatedAt,
    };
  };

  /**
   * Find the Thread which input message belongs to. If can not find thread, create one.
   *
   * @param {MessengerMessageType} message
   * @return {ThreadType}
   */
  getOrCreateThreadByMsg = async (message) => {
    const {
      sender: { id: senderId },
      recipient: { id: recipientId },
      message: { is_echo: isEcho },
    } = message;
    const uniqueKey = isEcho ? recipientId : senderId;
    const thread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });

    if (thread) return { thread, isCreated: false };

    const profile = await getUserProfileFB(uniqueKey, this.accessToken);
    const thr = await db.Thread.create({
      channelId: this.channel.id,
      uniqueKey,
      title: profile.name,
      status: THREAD_STATUS_UNREAD,
      additionData: {
        avatarUrl: profile.picture.data.url,
      },
    });
    return { thread: thr, isCreated: true };
  };

  /**
   * Find the customer own the message. If can not find, create one.
   *
   * @param {MessengerMessageType} message
   * @return {CustomerType}
   */
  getOrCreateCustomerByMsg = async (message) => {
    const {
      sender: { id: uniqueKey },
    } = message;
    const customer = await db.Customer.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });

    if (customer) return { customer, isCreated: false };
    const profile = await getUserProfileFB(uniqueKey, this.accessToken);
    const cus = await db.Customer.create({
      channelId: this.channel.id,
      uniqueKey,
      name: profile.name,
      additionData: {
        avatarUrl: profile.picture.data.url,
      },
    });
    return { customer: cus, isCreated: true };
  };

  triggerOnHandleMessage = async (savedMessage, thread) => {
    const oldMissCount = thread.missCount;
    await calculateInferenceField.oneLevel(savedMessage, thread);
    const missCountChange = thread.missCount - oldMissCount;
    const updatedThread = await db.Thread.findByPk(thread.id);
    this.emitSocketNewMessage(savedMessage, updatedThread, missCountChange);
  };

  /**
   * Navigate all event base on event.type
   * @param {Object} event
   */
  onEvent = async (event) => {
    debug(`Receive event:\n${JSON.stringify(event, null, 2)}`);
    switch (event.type) {
      case 'read':
        return this.onRead(event);
    }
  };

  /**
   * Handle onRead event
   * @param {Object} message
   */
  onRead = async (message) => {
    const {
      sender: { id: uniqueKey },
    } = message;
    const thread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });
    const updatedThread = await thread.update({
      readAt: formatTime(message.timestamp),
    });

    const threadWithLastMessage = await threadsWithLastMessage(updatedThread);

    const roomName = this.channel.configs.isBroadcast
      ? getRoomName(CHANNEL_SOCKET_KEY, this.channel.id)
      : getRoomName(THREAD_SOCKET_KEY, thread.id);

    emitThreadUpdateRead(this.app.io, roomName, {
      thread: threadWithLastMessage,
    });

    return updatedThread;
  };

  /**
   * Send message to facebook user
   * @param {Object} sendData
   */
  sendMessage = async (sendData) => {
    const { target: recipientId, message, attachment, userId } = sendData;
    debug(`send message to ${recipientId}\n${JSON.stringify(sendData, null, 2)}`);

    if (message && attachment) {
      return {
        success: false,
        response: { message: 'You can only send text or attachment' },
      };
    }

    const formData = new FormData();
    formData.append(
      'recipient',
      JSON.stringify({
        id: recipientId,
      }),
    );
    const messageData = message
      ? { text: message }
      : {
          attachment: {
            type: getAttachmentType(attachment),
            payload: {},
          },
        };
    formData.append('message', JSON.stringify(messageData));
    if (attachment) {
      formData.append('filedata', fs.createReadStream(attachment.path));
    }
    const result = await sendMessenger(formData, this.accessToken);

    // TODO: Better slice
    if (result.success) {
      result.response.message_id = result.response.message_id.slice(2);
    }
    if (result.success) client.set(result.response.message_id, userId);

    return result;
  };
}

export default Messenger;
MessengerMessageType
CustomerType