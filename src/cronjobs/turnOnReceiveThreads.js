import db from "models";
import { CronJob } from "cron";

const cronTime = "0 0 8 * * *";

const turnOnReceiveThreads = () => {
  let isCronRunning = false;
  return new CronJob({
    cronTime,
    onTick: () => {
      new Promise(async (resolve) => {
        if (isCronRunning) return;
        isCronRunning = true;
        const channels = await db.Channel.findAll();
        await Promise.all(
          channels.map(async (channel) => {
            if (!channel.configs.forceReceiveThreadsInWorkTime) return false;
            const users = await channel.getUsers();
            users.map(async (user) => {
              const channelUser = await db.ChannelUser.findOne({
                where: { channel_id: channel.id, user_id: user.id },
              });
              channelUser &&
                (await channelUser.update({
                  configs: {
                    ...channelUser.configs,
                    receiveAutoAssign: true,
                  },
                }));
            });
          })
        );
        resolve();
      }).finally(() => {
        isCronRunning = false;
      });
    },
    start: true,
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

export default turnOnReceiveThreads;
