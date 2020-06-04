export default (sequelize, DataTypes) => {
  const ChannelUser = sequelize.define(
    "ChannelUser",
    {
      configs: {
        type: DataTypes.JSON,
      },
    },
    {
      tableName: "channel_user",
    }
  );

  return ChannelUser;
};
