import {
  PERMISSION_READ_ALL_THREADS,
  THREAD_STATUS_PROCESSING,
  THREAD_STATUS_UNREAD,
} from "constants";
import moment from "moment";
import { checkUserPermission } from "utils/authorize";

export default (sequelize, DataTypes) => {
  const Channel = sequelize.define(
    "Channel",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      uniqueKey: {
        allowNull: false,
        field: "unique_key",
        type: DataTypes.STRING,
      },
      type: {
        allowNull: false,
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
        field: "addition_data",
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
      tableName: "channels",
      name: {
        singular: "channel",
        plural: "channels",
      },
    }
  );

  Channel.associate = function(models) {
    models.Channel.hasMany(models.Thread);
    models.Channel.hasMany(models.Tag);
    models.Channel.belongsToMany(models.User, {
      through: "ChannelUser",
    });
    models.Channel.hasMany(models.Role);
    models.Channel.hasOne(models.ToolBot);
  };

  Channel.getMissCountsByUserId = async function(userId) {
    const channels = await this.findAll();
    const missCountsByChannelIds = await Promise.all(
      channels.map(async (channel) => {
        const isUserBroadcast =
          (await checkUserPermission(
            userId,
            PERMISSION_READ_ALL_THREADS,
            channel.id
          )) || channel.configs.isBroadcast;

        const missCount = await sequelize.query(
          `SELECT
            SUM(threads.miss_count) 'missCount'
          FROM
          threads
            LEFT JOIN
            thread_user_serving ON thread_user_serving.thread_id = threads.id
          WHERE
            threads.channel_id = $channelId AND
          ${
            isUserBroadcast
              ? `threads.status IN ('${THREAD_STATUS_UNREAD}', '${THREAD_STATUS_PROCESSING}')`
              : `threads.status = '${THREAD_STATUS_PROCESSING}' AND thread_user_serving.user_id = $userId`
          }`,
          {
            bind: { userId, channelId: channel.id },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        return {
          channelId: channel.id,
          missCount: missCount.length > 0 ? missCount[0].missCount : 0,
        };
      })
    );

    return missCountsByChannelIds.reduce((acc, item) => {
      acc[item.channelId] = parseInt(item.missCount);
      return acc;
    }, {});
  };

  Channel.prototype.getUsersWithRolePermission = async function(
    channelId,
    limit,
    offset
  ) {
    const db = this.sequelize.models;

    return this.getUsers({
      limit,
      offset,
      include: [
        {
          model: db.Role,
          where: {
            channelId,
          },
          // NOTE: must have because not return user if condition false
          required: false,
          include: [
            {
              model: db.Permission,
              required: false,
            },
          ],
        },
      ],
    });
  };

  Channel.prototype.isBroadcast = function() {
    return this.configs && this.configs.isBroadcast;
  };
  Channel.prototype.isInWorkTime = function(_time = moment()) {
    const time = _time.add(7, "hours");
    const workTime = this.configs && this.configs.workTime;
    const isInWorkTime = workTime.some((work) => {
      const { start, end, week } = work;
      if (
        week[time.day()] &&
        start <= time.format("HH:mm") &&
        time.format("HH:mm") <= end
      ) {
        return true;
      }
    });
    return isInWorkTime;
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
      }
    );
    return parseInt(missCount) || 0;
  };

  return Channel;
};
