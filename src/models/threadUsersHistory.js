export default (sequelize) => {
  const ThreadUsersHistory = sequelize.define(
    "ThreadUsersHistory",
    {
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
      },
      updatedAt: {
        field: "updated_at",
        type: "TIMESTAMP",
      },
    },
    {
      tableName: "thread_user_history",
    }
  );

  return ThreadUsersHistory;
};
