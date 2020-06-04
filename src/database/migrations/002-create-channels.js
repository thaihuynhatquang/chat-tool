export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("channels", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        type: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        uniqueKey: {
          allowNull: false,
          field: "unique_key",
          type: Sequelize.STRING,
        },
        title: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        configs: {
          type: Sequelize.JSON,
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
        queryInterface.addIndex("channels", {
          fields: ["type", "unique_key"],
          type: "UNIQUE",
        })
      );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("channels");
  },
};
