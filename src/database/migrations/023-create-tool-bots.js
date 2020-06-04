export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tool_bots", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      channelId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        field: "channel_id",
      },
      endpoint: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      uniqueKey: {
        allowNull: false,
        field: "unique_key",
        type: Sequelize.STRING,
      },
      configs: {
        allowNull: false,
        type: Sequelize.JSON,
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
    return queryInterface.dropTable("tool_bots");
  },
};
