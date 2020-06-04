export default (sequelize, DataTypes) => {
  const TransferThread = sequelize.define(
    "TransferThread",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      threadId: {
        allowNull: false,
        field: "thread_id",
        type: DataTypes.INTEGER,
      },
      fromUserId: {
        allowNull: false,
        field: "from_user_id",
        type: DataTypes.INTEGER,
      },
      toUserId: {
        allowNull: false,
        field: "to_user_id",
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.STRING,
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
      tableName: "transfer_threads",
    }
  );

  TransferThread.associate = function(models) {
    models.TransferThread.belongsTo(models.Thread);
    models.TransferThread.belongsTo(models.User, {
      as: "fromUser",
      sourceKey: "fromUserId",
    });
  };

  return TransferThread;
};
