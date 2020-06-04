export default (sequelize, DataTypes) => {
  const ToolBotThread = sequelize.define(
    "ToolBotThread",
    {
      threadId: {
        allowNull: false,
        field: "thread_id",
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      isUse: {
        allowNull: false,
        field: "is_use",
        type: DataTypes.BOOLEAN,
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
      tableName: "tool_bot_thread",
      name: {
        singular: "toolBotThread",
        plural: "toolBotThreads",
      },
    }
  );
  ToolBotThread.associate = function(models) {
    models.ToolBotThread.belongsTo(models.Thread);
  };
  return ToolBotThread;
};
