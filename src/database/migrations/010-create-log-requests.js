export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("log_requests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      path: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      method: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      params: {
        type: Sequelize.JSON,
      },
      body: {
        type: Sequelize.JSON,
      },
      elapsedTime: {
        field: "elapsed_time",
        type: Sequelize.INTEGER,
      },
      responseStatus: {
        field: "response_status",
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable("log_requests");
  },
};
