import db from "models";
import { CronJob } from "cron";
import moment from "moment";
import client from "config/redis";
import { MEET_BOT, CHAT_CS } from "config/persistentMenu";
import startChannels from "core/startChannels";
import {
  QUICK_REPLY_MESSAGE_TYPE,
  THREAD_STATUS_UNREAD,
  THREAD_STATUS_PROCESSING,
} from "constants";
import { isWorkingTime } from "utils/time";
import { bootBotSendToThread } from "utils/chatbot";

const debug = require("debug")("app:cron");

const cronTime = "0 */1 * * * *";

const SUPPORT_MESSAGE = {
  content: `Hiện tại các tư vấn viên đang bận hoặc không online. Bạn có muốn chat với bot hay Đợi gặp tư vấn viên?`,
  templateType: QUICK_REPLY_MESSAGE_TYPE,
  optionList: [
    { name: "Chat với bot", value: MEET_BOT },
    { name: "Đợi gặp tư vấn viên", value: CHAT_CS },
  ],
};

const botSupportStaff = () => {
  let isCronRunning = false;
  return new CronJob({
    cronTime,
    onTick: () => {
      new Promise(async (resolve) => {
        if (isCronRunning) return;
        isCronRunning = true;

        debug(`Start running sending bot support staff message`);

        const channels = await db.Channel.findAll({
          include: [{ model: db.ToolBot, required: true }],
        });

        const channelIMs = await startChannels();

        await Promise.all(
          channels.map(async (channel) => {
            const {
              type,
              uniqueKey,
              toolBot: { configs },
            } = channel;
            const channelIM = channelIMs[type][uniqueKey];
            const askAfter = configs && configs.askAfter;
            const reAskAfter = configs && configs.reAskAfter;
            if (!channelIM || !askAfter || !reAskAfter) return;
            const missThreadholds = moment()
              .subtract(askAfter, "seconds")
              .format();

            const missThreads = await channel.getThreads({
              where: {
                missCount: { $gt: 0 },
                missTime: { $lt: missThreadholds },
                status: {
                  $in: [THREAD_STATUS_UNREAD, THREAD_STATUS_PROCESSING],
                },
              },
              include: [db.ToolBotThread],
            });

            debug(
              "Found",
              missThreads.length,
              "threads that miss more than",
              askAfter,
              "in channel",
              channel.uniqueKey
            );

            missThreads.forEach(async (thread) => {
              const redisKey = `lastSupportMsgAt:${thread.uniqueKey}`;
              const lastSupportMsgAt = await client.getAsync(redisKey);

              const isThreadUsingBot =
                (thread.toolBotThread && thread.toolBotThread.isUse) ||
                !isWorkingTime(channel);
              const shouldResend =
                !lastSupportMsgAt ||
                moment().diff(lastSupportMsgAt, "seconds") >= reAskAfter;

              const shouldBotSupportStaff = !isThreadUsingBot && shouldResend;

              if (shouldBotSupportStaff) {
                debug("Send support message to thread", thread.id);
                bootBotSendToThread(
                  {
                    customerId: thread.uniqueKey,
                    ...SUPPORT_MESSAGE,
                  },
                  channelIM.bot
                );
                client.setAsync(redisKey, moment().format());
              }
            });
          })
        );

        resolve();
      })
        .then(() => {
          isCronRunning = false;
        })
        .catch((err) => {
          // TODO: Logging error
          debug(`Running cron botSupportStaff error`, err);
          isCronRunning = false;
        });
    },
    start: true,
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

export default botSupportStaff;
