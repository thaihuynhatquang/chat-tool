import "@babel/polyfill";
import db from "models";

const appliedWeek = [true, true, true, true, true, true, false];
const workTime = [
  {
    start: "08:00",
    end: "12:00",
    week: appliedWeek,
  },
  {
    start: "13:00",
    end: "17:00",
    week: appliedWeek,
  },
];

export default {
  up: async () => {
    const channels = await db.Channel.findAll();
    return Promise.all(
      channels.map((channel) =>
        channel.update({ "configs.workTime": workTime })
      )
    );
  },
  down: async () => {
    const channels = await db.Channel.findAll();
    return Promise.all(
      channels.map((channel) => {
        const { workTime, ...configsOmitWorkTime } = channel.configs;
        return channel.update({ configs: configsOmitWorkTime });
      })
    );
  },
};
