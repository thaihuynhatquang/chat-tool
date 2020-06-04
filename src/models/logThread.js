export default (sequelize, DataTypes) => {
  const LogThread = sequelize.define(
    "LogThread",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        field: "user_id",
        type: DataTypes.STRING,
      },
      threadId: {
        field: "thread_id",
        allowNull: false,
        type: DataTypes.STRING,
      },
      oStatus: {
        field: "old_status",
        allowNull: false,
        type: DataTypes.STRING,
      },
      nStatus: {
        field: "new_status",
        allowNull: false,
        type: DataTypes.STRING,
      },
      note: {
        type: DataTypes.TEXT,
      },
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
      },
    },
    {
      tableName: "log_threads",
    }
  );
  LogThread.associate = function(models) {
    models.LogThread.belongsTo(models.Thread, {
      foreignKey: "thread_id",
      as: "thread",
    });
    models.LogThread.belongsTo(models.User);
  };
  return LogThread;
};
