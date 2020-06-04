import db from "models";
import {
  getBotReply,
  bootBotSendToThread,
  updateBotAnswer,
  getUserBot,
} from "utils/chatbot";
import { isWorkingTime } from "utils/time";
import { BOT_PAYLOAD_TYPE } from "constants";
import { forceStartBotEvents, forceEndBotEvents } from "config/persistentMenu";

export default async (msg, thread, bootbot) => {
  const bot = await db.ToolBot.findOne({
    where: { channelId: thread.channelId },
  });
  if (!bot) return;

  const { additionData, userId, hidden } = msg;
  if (hidden) return;

  // TODO: Optimize this
  const chatBotUser = await getUserBot();
  // Turn off bot whenever user sends message
  if (userId && userId !== chatBotUser.id) {
    await db.ToolBotThread.update(
      { isUse: false },
      { where: { threadId: thread.id } }
    );
  }

  if (msg.isVerified) return;

  // Force on bot using payload value data
  const messagePayload =
    additionData &&
    ((additionData.postback && additionData.postback.payload) ||
      (additionData.quickReply && additionData.quickReply.payload));

  if (
    messagePayload &&
    messagePayload.type === BOT_PAYLOAD_TYPE &&
    forceStartBotEvents.includes(messagePayload.value)
  ) {
    await db.ToolBotThread.upsert({ threadId: thread.id, isUse: true });
  }

  if (
    messagePayload &&
    messagePayload.type === BOT_PAYLOAD_TYPE &&
    forceEndBotEvents.includes(messagePayload.value)
  ) {
    await db.ToolBotThread.upsert({ threadId: thread.id, isUse: false });
  }

  const channel = await thread.getChannel();
  if (!channel) return;

  const botThread = await thread.getToolBotThread();

  const botReply = await getBotReply(msg, bot);

  const shouldSendBotMessage =
    (botThread && botThread.isUse) || !isWorkingTime(channel);

  if (shouldSendBotMessage) {
    // Send to FB
    const messageId = await bootBotSendToThread(botReply, bootbot);
    // Update msg for chatbot side
    updateBotAnswer(bot, botReply.ansId, { msgId: messageId });
  }

  if (["chat_cs", "end"].includes(botReply.groupType)) {
    await db.ToolBotThread.upsert({
      threadId: thread.id,
      isUse: false,
    });
  }
};
