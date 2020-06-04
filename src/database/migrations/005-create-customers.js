export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("customers", {
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
        uniqueKey: {
          allowNull: false,
          field: "unique_key",
          type: Sequelize.STRING,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING(1024),
        },
        phone: {
          type: Sequelize.STRING(50),
        },
        additionData: {
          field: "addition_data",
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
      })
      .then(() =>
        queryInterface.addIndex("customers", {
          fields: ["channel_id", "unique_key"],
          type: "UNIQUE",
        })
      );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("customers");
  },
};
