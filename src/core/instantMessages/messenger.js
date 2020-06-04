import Bootbot from "bootbot";
import client from "config/redis";
import { THREAD_STATUS_UNREAD } from "constants";
import triggerCheckCustomerPhone from "core/triggers/customerPhone";
import fs from "fs";
import {
  getFormatedMessageId,
  getParsable,
  nullIfEmptyObj,
} from "utils/common";
import { formatTime } from "utils/time";
import InstantMessage from "./interface";

const debug = require("debug")("app:im:messenger");

const getAttachmentType = (file) => {
  if (["audio", "video", "image"].includes(file.mimetype.split("/")[0])) {
    return file.mimetype.split("/")[0];
  }
  return "file";
};

class Messenger extends InstantMessage {
  appId;
  channel;
  accessToken;
  bot;

  constructor(channel) {
    super(channel);
    debug(`Init messenger channel ${channel.title}`);
    let {
      configs: { appId, accessToken, verifyToken, appSecret, broadcastEchoes },
    } = channel;
    if (!accessToken || !verifyToken || !appSecret) {
      throw new Error(
        "Require accessToken, verifyToken, appSecret to create Messenger IM"
      );
    }
    this.appId = appId;
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
      postback,
      message: { mid, text, attachments, quick_reply: quickReply },
      sender: { id: senderId },
      timestamp,
    } = message;
    const additionData = nullIfEmptyObj({
      attachments,
      postback: postback && {
        ...postback,
        payload: postback.payload && getParsable(postback.payload),
      },
      quickReply: quickReply && {
        ...quickReply,
        payload: quickReply.payload && getParsable(quickReply.payload),
      },
    });

    const msgCreatedAt = formatTime(timestamp);

    const _userId = await client.getAsync(mid);
    const mUserId = await client.getAsync(mid.substring(2));
    const userId = _userId || mUserId;

    const isVerified = senderId === this.channel.uniqueKey;
    const reviewContext = await db.LogReview.findOne({
      where: {
        isEnd: false,
        threadId: thread.id,
      },
    });

    const hidden = isVerified
      ? text
        ? text.startsWith("[Tin nhắn tự động]")
        : false
      : !!reviewContext && !!text && !!text.match(/^★{1,5}$/);

    return {
      mid,
      threadId: thread.id,
      customerId: customer.id,
      isVerified,
      hidden,
      content: text,
      userId: userId ? parseInt(userId) : null,
      additionData,
      msgCreatedAt,
      msgUpdatedAt: msgCreatedAt,
    };
  };

  getOrCreateThreadByMsg = async (message) => {
    const {
      sender: { id: senderId },
      recipient: { id: recipientId },
      message: { is_echo: isEcho, text, app_id: appId },
    } = message;
    const uniqueKey = isEcho ? recipientId : senderId;
    const thread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });

    const messageManualOrFromTool = !appId || this.appId === appId;

    if (thread) {
      // TODO: Fix this duplicate logic of checking message is hidden
      const isVerified = senderId === this.channel.uniqueKey;
      const reviewContext = await db.LogReview.findOne({
        where: {
          isEnd: false,
          threadId: thread.id,
        },
      });
      const isMessageHidden = isVerified
        ? text
          ? text.startsWith("[Tin nhắn tự động]")
          : false
        : !!reviewContext && !!text && !!text.match(/^★{1,5}$/);

      const shouldUpdateThreadStatus = isVerified
        ? !isMessageHidden && messageManualOrFromTool
        : !isMessageHidden;

      if (thread.status === THREAD_STATUS_DONE && shouldUpdateThreadStatus) {
        thread.update({ status: THREAD_STATUS_UNREAD });
      }
      return { thread, isCreated: false };
    }

    const profile = await getUserProfileFB(uniqueKey, this.accessToken);
    try {
      const isVerified = senderId === this.channel.uniqueKey;
      const shouldUpdateThreadStatus = isVerified
        ? messageManualOrFromTool
        : true;
      const thr = await db.Thread.create({
        channelId: this.channel.id,
        uniqueKey,
        title: profile.name,
        status: shouldUpdateThreadStatus
          ? THREAD_STATUS_UNREAD
          : THREAD_STATUS_DONE,
        additionData: {
          avatarUrl:
            profile &&
            profile.picture &&
            profile.picture.data &&
            profile.picture.data.url,
        },
      });
      return { thread: thr, isCreated: true };
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        const thr = await db.Thread.findOne({
          where: { channelId: this.channel.id, uniqueKey },
        });
        if (thr) {
          return { thread: thr, isCreated: false };
        } else {
          throw new Error(
            `Cannot find or create Thread with channelId ${this.channel.id} and uniqueKey ${uniqueKey}`
          );
        }
      }
    }
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
    try {
      const cus = await db.Customer.create({
        channelId: this.channel.id,
        uniqueKey,
        name: profile.name,
        additionData: {
          avatarUrl: profile.picture.data.url,
        },
      });
      return { customer: cus, isCreated: true };
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        const cus = await db.Customer.findOne({
          where: { channelId: this.channel.id, uniqueKey },
        });
        if (cus) {
          return { customer: cus, isCreated: false };
        } else {
          throw new Error(
            `Cannot find or create Customer with channelId ${this.channel.id} and uniqueKey ${uniqueKey}`
          );
        }
      }
    }
  };

  triggerOnHandleMessage = async (message, thread) => {
    triggerCheckCustomerPhone(message, thread);
    triggerChatbot(message, thread, this.bot);
    !message.hidden && calculateInferenceField.oneLevel(message, thread);
    !message.isVerified &&
      handleConversationResponse(this.bot, message, thread);
  };

  onEvent = async (event) => {
    switch (event.type) {
      case "read":
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
    if (!thread) return;

    await thread.update({
      readAt: formatTime(message.timestamp),
    });
  };

  sendMessage = async (sendData) => {
    const { target: recipientId, message, attachment, userId } = sendData;
    debug(
      `send message to ${recipientId}\n${JSON.stringify(sendData, null, 2)}`
    );

    if (message && attachment) {
      return {
        success: false,
        response: { message: "You can only send text or attachment" },
      };
    }

    const formData = new FormData();
    formData.append(
      "recipient",
      JSON.stringify({
        id: recipientId,
      })
    );
    const messageData = message
      ? { text: message }
      : {
          attachment: {
            type: getAttachmentType(attachment),
            payload: {},
          },
        };
    formData.append("message", JSON.stringify(messageData));
    if (attachment) {
      formData.append("filedata", fs.createReadStream(attachment.path));
    }
    const result = await sendMessenger(formData, this.accessToken);

    if (result.success) {
      result.response.message_id = getFormatedMessageId(
        result.response.message_id
      );
    }
    if (result.success) client.set(result.response.message_id, userId);

    return result;
  };

  reloadMessage = async (message) => {
    const messageInfo = await loadMessage(
      `m_${message.mid}`,
      ["message", "attachments"],
      this.accessToken
    );

    const { message: content } = messageInfo;
    const attachmentsData =
      (messageInfo &&
        messageInfo.attachments &&
        messageInfo.attachments.data) ||
      [];

    const getPayloadAttachment = (type, attachment) => {
      switch (attachment) {
        case "image":
          return attachment[`${type}_data`];

        default:
          return {
            url: attachment[`file_url`],
          };
      }
    };

    const attachments = attachmentsData.map((item) => {
      const type = item.mime_type.split("/")[0];
      let payload = getPayloadAttachment(type, item);

      return {
        type,
        payload,
      };
    });

    const additionData = _.merge(message.additionData, { attachments });
    message.set("content", content);
    message.set("additionData", additionData);

    return message.save();
  };

  reloadChannel = async (channel) => {
    const channelInfo = await loadChannel(
      channel.uniqueKey,
      ["name", "picture"],
      this.accessToken
    );

    const {
      name,
      picture: {
        data: { url: avatarUrl },
      },
    } = channelInfo;

    const additionData = _.merge(channel.additionData, { name, avatarUrl });
    channel.set("additionData", additionData);
    return channel.save();
  };

  reloadThread = async (thread) => {
    const threadInfo = await getUserProfileFB(
      thread.uniqueKey,
      this.accessToken
    );
    const {
      name,
      picture: {
        data: { url: avatarUrl },
      },
    } = threadInfo;

    const additionData = _.merge(thread.additionData, { avatarUrl });
    thread.set("title", name);
    thread.set("additionData", additionData);
    return thread.save();
  };

  reloadCustomer = async (customer) => {
    const customerInfo = await getUserProfileFB(
      customer.uniqueKey,
      this.accessToken
    );
    const {
      name,
      picture: {
        data: { url: avatarUrl },
      },
    } = customerInfo;

    const additionData = _.merge(customer.additionData, { avatarUrl });
    customer.set("name", name);
    customer.set("additionData", additionData);
    return customer.save();
  };

  clearMissMessage = async (message, thread) => {
    thread.set("missCount", 0);
    thread.set("missTime", null);
    await Promise.all([thread.save(), message.save()]);
  };

  clearMissThread = async (thread) => {
    thread.set("missTime", null);
    thread.set("missCount", 0);
    await thread.save();
  };
}

export default Messenger;
