"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const toolBots = [
      {
        id: 1,
        channel_id: 2,
        endpoint: "http://dev.botflow.teko.vn",
        unique_key: "bot",
        configs: {
          askAfter: 600,
          reAskAfter: 86400,
        },
      },
      {
        id: 2,
        channel_id: 3,
        endpoint: "http://dev.botflow.teko.vn",
        unique_key: "bot",
        configs: {
          askAfter: 600,
          reAskAfter: 86400,
        },
      },
    ];
    return queryInterface.bulkInsert(
      "tool_bots",
      toolBots,
      {},
      {
        configs: { type: new Sequelize.JSON() },
        addition_data: { type: new Sequelize.JSON() },
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "tool_bots",
      {
        id: {
          [Sequelize.Op.in]: [1, 2],
        },
      },
      {}
    );
  },
};
