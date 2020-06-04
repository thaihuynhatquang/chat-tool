import { TOOL_STOCK_CHECK_KEY } from "constants";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "tools",
      [
        {
          unique_key: TOOL_STOCK_CHECK_KEY,
          endpoint: "http://search-dev.phongvu.vn/api",
          configs: {
            channelId: "test",
          },
        },
      ],
      {},
      {
        configs: { type: new Sequelize.JSON() },
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete(
      "tools",
      {
        unique_key: TOOL_STOCK_CHECK_KEY,
      },
      {}
    );
  },
};
