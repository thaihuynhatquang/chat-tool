import "@babel/polyfill";
import db from "models";
import { THREAD_ASSIGN_MODE_AUTO, THREAD_ASSIGN_MODE_MANUAL } from "constants";
export default {
  up: async () => {
    const channels = await db.Channel.findAll({});
    return Promise.all(
      channels.map(async (channel) => {
        let configs = channel.configs;
        switch (channel.configs.assignMode) {
          case THREAD_ASSIGN_MODE_MANUAL: {
            channel.set("configs", {
              ...configs,
              useReunread: false,
              timeReunread: 300, // 5 min
            });
            break;
          }
          case THREAD_ASSIGN_MODE_AUTO: {
            channel.set("configs", {
              ...configs,
              useReunread: true,
              timeReunread: 300, // 5 min
            });
            break;
          }
        }
        return channel.save();
      })
    );
  },
  down: async () => {
    const channels = await db.Channel.findAll({});
    return Promise.all(
      channels.map(async (channel) => {
        let { useReunread, timeReunread, ...configs } = channel.configs;
        switch (channel.configs.assignMode) {
          case THREAD_ASSIGN_MODE_MANUAL: {
            channel.set("configs", configs);
            break;
          }
          case THREAD_ASSIGN_MODE_AUTO: {
            channel.set("configs", configs);
            break;
          }
        }
        return channel.save();
      })
    );
  },
};
