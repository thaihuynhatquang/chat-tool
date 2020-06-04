export default (sequelize, DataTypes) => {
  const ToolBot = sequelize.define(
    "ToolBot",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      channelId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: "channel_id",
      },
      endpoint: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      uniqueKey: {
        allowNull: false,
        field: "unique_key",
        type: DataTypes.STRING,
      },
      configs: {
        allowNull: false,
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
      tableName: "tool_bots",
      name: {
        singular: "toolBot",
        plural: "toolBots",
      },
    }
  );
  ToolBot.associate = function(models) {
    models.ToolBot.belongsTo(models.Channel);
  };
  return ToolBot;
};
