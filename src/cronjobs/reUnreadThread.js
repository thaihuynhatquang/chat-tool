import db from "models";
import { CronJob } from "cron";
import moment from "moment";
import {
  THREAD_STATUS_UNREAD,
  THREAD_STATUS_PROCESSING,
  THREAD_SOCKET_KEY,
} from "constants";
import { logError } from "utils/logging";
import { getRoomName, socketsLeaveRoomByUserIds } from "utils/socket";
import Promise from "bluebird";
const debug = require("debug")("app:cron");
const cronTime = "*/30 * * * * *";

const CONCURRENT_THREAD = 20;
const CONCURRENT_CHANNEL = 2;

const getChannelsShouldRun = () =>
  db.Channel.findAll({
    where: {
      "configs.useReunread": true,
    },
  });

const getThreadShouldRun = (channel) => {
  if (!channel.isInWorkTime()) return Promise.resolve([]);
  const timeToUpdate = moment
    .unix(moment().unix() - channel.configs.timeReunread)
    .toISOString();

  // $FlowFixMe
  return db.Thread.findAll({
    where: {
      channelId: channel.id,
      status: THREAD_STATUS_PROCESSING,
      missTime: { $lte: timeToUpdate },
      missCount: { $ne: 0 },
    },
    include: [
      {
        model: db.User,
        as: "usersServing",
        required: true,
        through: { where: { created_at: { $lte: timeToUpdate } } },
      },
    ],
  });
};

const execThread = async (thread) => {
  const usersServing = await thread.getUsersServing();
  socketsLeaveRoomByUserIds(
    usersServing.map((user) => user.id),
    getRoomName(THREAD_SOCKET_KEY, thread.id)
  );
  thread.set("status", THREAD_STATUS_UNREAD);
  thread.setUsersServing([]);
  return thread.save();
};

const execChannel = (channel) => {
  const threads = getThreadShouldRun(channel);
  return Promise.map(threads, execThread, { concurrency: CONCURRENT_THREAD });
};

const reUnreadThread = () => {
  let isCronRunning = false;
  return new CronJob({
    cronTime,
    onTick: () => {
      new Promise(async (resolve) => {
        if (isCronRunning) return;
        isCronRunning = true;
        debug(`Start running reUnread Thread`);

        const channels = await getChannelsShouldRun();
        await Promise.map(channels, execChannel, {
          concurrency: CONCURRENT_CHANNEL,
        });

        debug(`Finish running reUnread Thread`);
        resolve();
      })
        .catch((err) => {
          logError(err, true);
          debug(`Start running reUnread Thread error`, err);
        })
        .finally(() => {
          isCronRunning = false;
        });
    },
    start: true,
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

export default reUnreadThread;
