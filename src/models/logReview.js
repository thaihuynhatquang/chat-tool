export default (sequelize, DataTypes) => {
  const LogReview = sequelize.define(
    "LogReview",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      threadId: {
        allowNull: false,
        field: "thread_id",
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        field: "user_id",
        type: DataTypes.INTEGER,
      },
      isEnd: {
        allowNull: false,
        field: "is_end",
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      currentQuestion: {
        allowNull: false,
        field: "current_question",
        type: DataTypes.STRING,
      },
      answers: {
        allowNull: false,
        defaultValue: [],
        type: DataTypes.JSON,
      },
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
      tableName: "log_reviews",
    }
  );

  LogReview.associate = function(models) {
    models.LogReview.belongsTo(models.User);
  };

  return LogReview;
};
