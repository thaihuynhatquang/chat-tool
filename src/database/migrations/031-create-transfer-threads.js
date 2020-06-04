export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("transfer_threads", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      threadId: {
        allowNull: false,
        field: "thread_id",
        type: Sequelize.INTEGER,
      },
      fromUserId: {
        allowNull: false,
        field: "from_user_id",
        type: Sequelize.INTEGER,
      },
      toUserId: {
        allowNull: false,
        field: "to_user_id",
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable("transfer_threads");
  },
};
