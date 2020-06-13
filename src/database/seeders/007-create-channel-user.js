import { flatten } from "utils/common";
const userIds = [1, 2];
const channelIds = [1, 2];

const channelUsers = flatten(
  channelIds.map((channelId) => {
    return userIds.map((userId) => ({
      user_id: userId,
      channel_id: channelId,
    }));
  })
);

export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert("channel_user", channelUsers, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "channel_user",
      {
        user_id: {
          [Sequelize.Op.in]: [1, 2],
        },
      },
      {}
    );
  },
};
