'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define(
    'Channel',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      uniqueKey: {
        allowNull: false,
        field: 'unique_key',
        unique: 'compositeIndex',
        type: DataTypes.STRING,
      },
      type: {
        allowNull: false,
        unique: 'compositeIndex',
        type: DataTypes.STRING,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      configs: {
        type: DataTypes.JSON,
      },
      additionData: {
        field: 'addition_data',
        type: DataTypes.JSON,
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP',
      },
      updatedAt: {
        field: 'updated_at',
        type: 'TIMESTAMP',
      },
    },
    {
      tableName: 'channels',
    },
  );

  Channel.associate = function(models) {
    models.Channel.hasMany(models.Thread);
    models.Channel.belongsToMany(models.User, {
      through: 'channel_user',
    });
  };

  Channel.getMissCountsByUserId = async function(userId) {
    let missCountsByChannelIds = await sequelize.query(
      `SELECT 
      threads.channel_id 'channelId',
      SUM(threads.miss_count) 'missCount'
      FROM
          threads
              INNER JOIN
          channels ON channels.id = threads.channel_id
      WHERE
          JSON_EXTRACT(channels.configs, '$.isBroadcast') = TRUE or threads.id IN (SELECT 
                  thread_id
              FROM
                  thread_user_serving
              WHERE
                  thread_user_serving.user_id = $userId)
      GROUP BY threads.channel_id`,
      { bind: { userId }, type: sequelize.QueryTypes.SELECT },
    );

    missCountsByChannelIds = missCountsByChannelIds.reduce((acc, item) => {
      acc[item.channelId] = parseInt(item.missCount);
      return acc;
    }, {});

    return missCountsByChannelIds;
  };

  Channel.prototype.getMissCountByUserId = async function(userId) {
    const { isBroadcast } = this.configs;
    const [{ missCount }] = await sequelize.query(
      `SELECT 
      SUM(threads.miss_count) 'missCount'
      FROM
          threads
      WHERE
        ($isBroadcast = TRUE
            OR threads.id IN (SELECT 
                thread_id
            FROM
                thread_user_serving
            WHERE
                thread_user_serving.user_id = $userId))
            AND threads.channel_id = $channelId`,
      {
        bind: { userId, channelId: this.id, isBroadcast },
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return parseInt(missCount) || 0;
  };

  return Channel;
};
