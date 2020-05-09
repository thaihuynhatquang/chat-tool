import FormData from 'form-data';
import fs from 'fs';
import db from 'models';
import InstantMessage from './interface';
import Bootbot from 'bootbot';
import { nullIfEmptyObj } from 'utils/common';
import { getUserProfileFB, sendMessenger } from 'utils/graph';
import { formatTime } from 'utils/time';
import { THREAD_STATUS_UNREAD } from 'constants';
import * as calculateInferenceField from '../triggers/calculateInferenceField';
import client from 'config/redis';

const debug = require('debug')('app:im:messenger');

const getAttachmentType = (file) => {
  if (['audio', 'video', 'image'].includes(file.mimetype.split('/')[0])) {
    return file.mimetype.split('/')[0];
  }
  return 'file';
};

class Messenger extends InstantMessage {
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
      userId,
      additionData,
      msgCreatedAt,
      msgUpdatedAt: msgCreatedAt,
    };
  };

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
    this.emitSocketNewMessage(savedMessage, thread, missCountChange);
  };

  onEvent = async (event) => {
    debug(`Receive event:\n${JSON.stringify(event, null, 2)}`);
    switch (event.type) {
      case 'read':
        return this.onRead(event);
    }
  };

  onRead = async (message) => {
    const {
      sender: { id: uniqueKey },
    } = message;
    const thread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });
    return thread.update({ readAt: formatTime(message.timestamp) });
  };

  sendMessage = async (sendData) => {
    const { target: recipientId, message, attachment, userId } = sendData;
    debug(`send message to ${recipientId}\n${JSON.stringify(sendData, null, 2)}`);

    if (message && attachment) {
      return {
        success: false,
        response: 'You can only send text or attachment',
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

    if (result.success) client.set(result.response.message_id.slice(2), userId);

    return result;
  };
}

export default Messenger;
