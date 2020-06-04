export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("roles", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        channelId: {
          allowNull: false,
          field: "channel_id",
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        key: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
        },
        color: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          field: "created_at",
          allowNull: false,
          type: "TIMESTAMP",
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          field: "updated_at",
          allowNull: false,
          type: "TIMESTAMP",
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      })
      .then(() =>
        queryInterface.addIndex("roles", {
          fields: ["key", "channel_id"],
          type: "UNIQUE",
        })
      );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("roles");
  },
};
