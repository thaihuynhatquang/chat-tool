"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("log_threads", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        field: "user_id",
        type: Sequelize.STRING,
      },
      threadId: {
        field: "thread_id",
        allowNull: false,
        type: Sequelize.STRING,
      },
      oStatus: {
        field: "old_status",
        allowNull: false,
        type: Sequelize.STRING,
      },
      nStatus: {
        field: "new_status",
        allowNull: false,
        type: Sequelize.STRING,
      },
      note: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        field: "created_at",
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("LogThreads");
  },
};
