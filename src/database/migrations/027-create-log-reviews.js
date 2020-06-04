export default {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("log_reviews", {
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
      threadId: {
        allowNull: false,
        field: "thread_id",
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        field: "user_id",
        type: Sequelize.INTEGER,
      },
      isEnd: {
        allowNull: false,
        field: "is_end",
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      currentQuestion: {
        allowNull: false,
        field: "current_question",
        type: Sequelize.STRING,
      },
      answers: {
        allowNull: false,
        defaultValue: [],
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
    }),
  down: (queryInterface) => queryInterface.dropTable("log_reviews"),
};
