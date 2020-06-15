import axios from "axios";
import db from "models";
import {
  QUICK_REPLY_MESSAGE_TYPE,
  CARD_MESSAGE_TYPE,
  BUTTON_MESSAGE_TYPE,
  BOT_PAYLOAD_TYPE,
  BOT_USER_IAM_ID,
  EXPIRED_TIME,
} from "constants";
import moment from "moment";
import client from "config/redis";
import { getStringify, getFormatedMessageId } from "utils/common";

export const getBotReply = async (message, bot) => {
  const customer = await db.Customer.findByPk(message.customerId);
  if (!customer) throw new Error("Cannot find customer when get bot reply");

  const previousMsg = await db.Message.findOne({
    where: {
      isVerified: false,
      $or: [
        {
          msgCreatedAt: {
            $lt: message.msgCreatedAt,
          },
        },
        {
          msgCreatedAt: {
            $eq: message.msgCreatedAt,
          },
          mid: {
            $lt: message.mid,
          },
        },
      ],
    },
    order: [
      ["msgCreatedAt", "DESC"],
      ["mid", "DESC"],
    ],
  });

  const startConversation =
    (previousMsg &&
      moment(message.msgCreatedAt).diff(
        moment(previousMsg.msgCreatedAt),
        "hours"
      ) >= 4) ||
    (message.additionData &&
      message.additionData.postback &&
      message.additionData.postback.payload === "GET_STARTED")
      ? 1
      : 0;

  const chosenObject =
    message.additionData &&
    (message.additionData.postback || message.additionData.quickReplies);

  const chosenOption =
    chosenObject && chosenObject.payload && chosenObject.payload.value;

  const botReply = await axios
    .get(`${bot.endpoint}/api/answer`, {
      params: {
        customerId: customer.uniqueKey,
        msgId: message.mid,
        inboxType: chosenOption ? "option" : "text",
        startConversation,
        content: message.content,
        chosenOption,
      },
      timeout: 30000,
    })
    .then((res) => res.data);

  return botReply.data;
};

export const updateBotAnswer = (bot, ansId, payload) =>
  client.post(`${bot.endpoint}/api/update_msg_id/${ansId}`, payload);

export const bootBotSendToThread = async (botData, bootbot) => {
  const user = await db.User.findOne({
    where: { googleId: BOT_USER_IAM_ID },
  });

  const resBootBot = await sendToThread(botData, bootbot, user);
  if (!resBootBot) return null;

  // resBootBot is last message
  const { message_id: messageId, error } = resBootBot;

  if (error) return null;

  // setRedis {msgId: botId}
  if (!user) return messageId;
  // message format 'm_*'
  client.set(getFormatedMessageId(messageId), `${user.id}`);

  return messageId;
};

const sendToThread = async (botData, bootbot, userBot) => {
  const { customerId, templateType, optionList, content } = botData;
  if (!content) return null;
  switch (templateType) {
    case QUICK_REPLY_MESSAGE_TYPE:
      return bootbot.say(customerId, {
        text: content,
        quickReplies: optionList.map((op) => ({
          title: op.name,
          payload: getStringify({
            type: BOT_PAYLOAD_TYPE,
            value: op.value,
          }),
        })),
        typing: true,
      });
    case CARD_MESSAGE_TYPE:
      const { message_id: _messageId } = await bootbot.say(customerId, content);
      if (userBot && _messageId) {
        // message format 'm_*'
        await client.set(getFormatedMessageId(_messageId), `${userBot.id}`);
      }

      return bootbot.say(customerId, {
        cards: optionList.map(
          (card) => ({
            title: card.title,
            image_url: card.image,
            default_action: {
              type: "web_url",
              url: card.url,
              webview_height_ratio: "tall",
            },
            ...(card.description && { subtitle: card.description }),
            buttons:
              card.options &&
              card.options.map((option) => ({
                title: option.name,
                type: option.optionType,
                ...(option.optionType === "postback"
                  ? {
                      payload: getStringify({
                        type: BOT_PAYLOAD_TYPE,
                        value: option.value,
                      }),
                    }
                  : undefined),
                ...(option.optionType === "web_url"
                  ? { url: option.value }
                  : undefined),
              })),
          }),
          {
            imageAspectRatio: "square",
            typing: true,
          }
        ),
      });

    // TODO: not test because current version bot is not use this type
    case BUTTON_MESSAGE_TYPE:
      return bootbot.say(customerId, {
        text: content,
        buttons: optionList.map((button) => ({
          type: button.optionType,
          title: button.name,
          ...(button.optionType === "web_url"
            ? { url: button.value }
            : undefined),
          ...(button.optionType === "postback"
            ? {
                payload: getStringify({
                  type: BOT_PAYLOAD_TYPE,
                  value: button.value,
                }),
              }
            : undefined),
        })),
      });
    default:
      return bootbot.say(customerId, content, { typing: true });
  }
};

export const getUserBot = async () => {
  const USER_BOT = "userBot";
  const userBot = await client.getAsync(USER_BOT);

  if (userBot) return JSON.parse(userBot);

  const chatBotUser = await db.User.findOne({
    where: { googleId: BOT_USER_IAM_ID },
  }).then((user) => (!user ? null : user.toJSON()));

  client.set(USER_BOT, JSON.stringify(chatBotUser), "EX", EXPIRED_TIME);
  // $FlowFixMe
  return chatBotUser;
};
