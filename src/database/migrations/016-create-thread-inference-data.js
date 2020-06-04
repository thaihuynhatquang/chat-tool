export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("thread_inference_data", {
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
        uniqueKey: {
          allowNull: false,
          field: "unique_key",
          type: Sequelize.STRING,
        },
        missCount: {
          field: "miss_count",
          type: Sequelize.INTEGER,
        },
        missTime: {
          field: "miss_time",
          type: "TIMESTAMP",
        },
        lastMsgId: {
          field: "last_msg_id",
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          field: "created_at",
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          field: "updated_at",
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      })
      .then(() =>
        queryInterface.addIndex("thread_inference_data", {
          fields: ["thread_id", "unique_key"],
          type: "UNIQUE",
        })
      );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("thread_inference_data");
  },
};
