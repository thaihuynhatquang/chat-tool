export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("thread_user_serving", {
      threadId: {
        allowNull: false,
        field: "thread_id",
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        field: "user_id",
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("thread_user_serving");
  },
};
