import db from "models";
import { CronJob } from "cron";
import Promise from "bluebird";
import {
  THREAD_STATUS_UNREAD,
  THREAD_STATUS_PROCESSING,
  THREAD_SOCKET_KEY,
} from "constants";
import {
  MAX_ASSIGN_THREADS_PER_USER,
  THREAD_ASSIGN_MODE_AUTO,
} from "constants";
import { logError, currentTime } from "utils/logging";
import { getBestUserForThread } from "utils/instantMessages";
import {
  getAssignableUserIdsOfChannel,
  socketsJoinRoomByUserIds,
  getRoomName,
} from "utils/socket";

const debug = require("debug")("app:cron");

const cronTime = "*/20 * * * * *";

const startThreadsAssign = () => {
  let isCronRunning = false;
  return new CronJob({
    cronTime,
    onTick: () => {
      new Promise(async (resolve) => {
        if (isCronRunning) return;
        isCronRunning = true;
        debug(`Start running threads assign`);

        const channels = await db.Channel.findAll({
          where: { configs: { assignMode: THREAD_ASSIGN_MODE_AUTO } },
        });

        let countAssign = {};

        await Promise.all(
          channels.map(async (channel) => {
            const unReadThreadsPromise = channel.getThreads({
              where: { status: THREAD_STATUS_UNREAD },
            });
            const channelOnlineUserIdsPromise = getAssignableUserIdsOfChannel(
              channel
            );
            const notReceiveAutoAssignUserIds = (
              await db.ChannelUser.findAll({
                where: {
                  configs: { receiveAutoAssign: false },
                },
              })
            ).map((channelUser) => channelUser.user_id);

            const unReadThreads = await unReadThreadsPromise;
            const channelOnlineUserIds = await channelOnlineUserIdsPromise;

            const shouldAssignUserIds = channelOnlineUserIds.filter(
              (userId) => !notReceiveAutoAssignUserIds.includes(userId)
            );

            channelOnlineUserIds.length > 0 &&
              (await Promise.each(unReadThreads, async (thread) => {
                const bestUserIdToAssign = await getBestUserForThread(
                  shouldAssignUserIds,
                  thread
                );

                if (!bestUserIdToAssign) return;
                console.info(
                  `[LOG-ASSIGN][${currentTime()}] Assign thread ${
                    thread.id
                  } to user ${bestUserIdToAssign}.\n`,
                  `Noti users: ${shouldAssignUserIds.toString()}.\n`,
                  `Online users: ${channelOnlineUserIds.toString()}.\n`,
                  `Current countAssign:`,
                  countAssign
                );
                if (!countAssign.hasOwnProperty(channel.id)) {
                  countAssign[channel.id] = {};
                }
                if (
                  !countAssign[channel.id].hasOwnProperty(bestUserIdToAssign)
                ) {
                  countAssign[channel.id][bestUserIdToAssign] = 0;
                }

                if (
                  countAssign[channel.id][bestUserIdToAssign] >
                  (20 * MAX_ASSIGN_THREADS_PER_USER) / 100
                ) {
                  return;
                }
                countAssign[channel.id][bestUserIdToAssign]++;

                // NOTE: MUST JOIN ROOM BEFORE UPDATE THREAD
                await socketsJoinRoomByUserIds(
                  [bestUserIdToAssign],
                  getRoomName(THREAD_SOCKET_KEY, thread.id)
                );
                await Promise.all([
                  thread.update({ status: THREAD_STATUS_PROCESSING }),
                  thread.setUsersServing([bestUserIdToAssign]),
                  thread.addUsersHistory(bestUserIdToAssign, {
                    through: { updatedAt: new Date() },
                  }),
                ]);
              }));
          })
        );

        resolve();
      })
        .then(() => {
          debug(`Finish running threads assign`);
        })
        .catch((err) => {
          logError(err, true);
          debug(`Running threads assign cron error`, err);
        })
        .finally(() => {
          isCronRunning = false;
        });
    },
    start: true,
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

export default startThreadsAssign;
