"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tool_bot_thread", {
      threadId: {
        allowNull: false,
        field: "thread_id",
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isUse: {
        allowNull: false,
        field: "is_use",
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        field: "updated_at",
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("tool_bot_thread");
  },
};
