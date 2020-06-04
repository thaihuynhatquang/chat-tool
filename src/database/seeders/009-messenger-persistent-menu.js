import "@babel/polyfill";
import persistentMenu from "config/persistentMenu";
import { MESSENGER_CHANNEL_TYPE } from "constants";
import Messenger from "core/instantMessages/messenger";
import db from "models";

const appliedUniqueKey = [
  "1948539038572011",
  "327316611412448",
  "719821268410677",
];

// This seed calls external API.
// SO IT'S EXPECTED TO BE FAILED SOMETIMES!!!
// It doesn't throw the error, it just logs the error details.
// So if it fails (knowing by reading the logs),
// you should manual re-run the seed.
export default {
  up: async () => {
    const { Op } = db.Sequelize;
    const channels = await db.Channel.findAll({
      where: {
        uniqueKey: { [Op.in]: appliedUniqueKey },
        type: MESSENGER_CHANNEL_TYPE,
      },
    });

    return Promise.all(
      channels.map(async (channel) => {
        console.log("Setting channel", channel.uniqueKey, "persistent menu");
        const channelIM = new Messenger(channel);
        const bootbot = channelIM.bot;
        await bootbot.setGetStartedButton("GET_STARTED");
        await bootbot.setPersistentMenu(persistentMenu);

        return true;
      })
    );
  },
  down: async () => {
    const { Op } = db.Sequelize;
    const channels = await db.Channel.findAll({
      where: {
        uniqueKey: { [Op.in]: appliedUniqueKey },
        type: MESSENGER_CHANNEL_TYPE,
      },
    });

    return Promise.all(
      channels.map(async (channel) => {
        console.log("Reverting channel", channel.uniqueKey, "persistent menu");
        const channelIM = new Messenger(channel);
        const bootbot = channelIM.bot;
        await bootbot.deletePersistentMenu();
        await bootbot.deleteGetStartedButton();

        return true;
      })
    );
  },
};
