import io from "config/socket";
import {
  SOCKET_UPDATE_THREAD,
  CHANNEL_SOCKET_KEY,
  THREAD_SOCKET_KEY,
  THREAD_STATUS_SPAM,
  THREAD_STATUS_PROCESSING,
  THREAD_STATUS_NEW,
  CRONJOB_NOTE_THREAD_CHANGE_STATUS,
  EMPTY_USER,
} from "constants";
import { getRoomName } from "utils/socket";

const joinLastMessage = async (db, threads) => {
  const lastMsgIds = threads
    .filter((thread) => thread.lastMsgId)
    .map((thread) => thread.lastMsgId);

  const lastMsgs = await db.Message.withCustomerAndUser({
    where: { mid: lastMsgIds },
  });

  const result = threads.map((thread) => {
    const threadToJSON = thread.toJSON ? thread.toJSON() : thread;
    return {
      ...threadToJSON,
      lastMessage: lastMsgs.find((item) => item.mid === thread.lastMsgId),
    };
  });

  return result;
};

export default (sequelize, DataTypes) => {
  const Thread = sequelize.define(
    "Thread",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      channelId: {
        allowNull: false,
        field: "channel_id",
        type: DataTypes.INTEGER,
      },
      uniqueKey: {
        allowNull: false,
        field: "unique_key",
        type: DataTypes.STRING,
      },
      title: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      additionData: {
        field: "addition_data",
        type: DataTypes.JSON,
      },
      missCount: {
        field: "miss_count",
        type: DataTypes.INTEGER,
      },
      missTime: {
        field: "miss_time",
        type: "TIMESTAMP",
      },
      lastMsgId: {
        field: "last_msg_id",
        type: DataTypes.STRING,
      },
      lastMsgAt: {
        field: "last_msg_at",
        allowNull: true,
        type: "TIMESTAMP",
      },
      readAt: {
        field: "read_at",
        type: "TIMESTAMP",
      },
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
      },
      updatedAt: {
        field: "updated_at",
        type: "TIMESTAMP",
      },
      deletedAt: {
        field: "deleted_at",
        type: "TIMESTAMP",
      },
    },
    {
      tableName: "threads",
      name: {
        singular: "thread",
        plural: "threads",
      },
    }
  );

  Thread.associate = function(models) {
    models.Thread.belongsTo(models.Channel);
    models.Thread.belongsToMany(models.Customer, {
      through: "customer_thread",
    });
    models.Thread.belongsToMany(models.User, {
      as: "usersServing",
      through: "thread_user_serving",
      updatedAt: false,
    });
    models.Thread.belongsToMany(models.User, {
      as: "usersHistory",
      through: "ThreadUsersHistory",
    });
  };

  Thread.scopes = function(models) {
    models.Thread.addScope("withUsersServingAndHistory", {
      include: [
        { model: models.User, as: "usersServing" },
        { model: models.User, as: "usersHistory" },
      ],
    });
  };

  Thread.joinLastMessage = async function(inp) {
    const db = this.sequelize.models;
    const isArray = Array.isArray(inp);
    const threads = isArray ? inp : [inp];
    const threadsWithLastMessage = await joinLastMessage(db, threads);

    return isArray ? threadsWithLastMessage : threadsWithLastMessage[0];
  };

  Thread.withLastMessage = async function(options) {
    const db = this.sequelize.models;
    const threads = await this.findAll(options);

    return joinLastMessage(db, threads);
  };

  Thread.prototype.withLastMessage = async function() {
    const db = this.sequelize.models;
    const lastMsg = await db.Message.findByPk(this.lastMsgId);
    if (!lastMsg) return this.toJSON();

    return {
      ...this.toJSON(),
      lastMessage: await lastMsg.withCustomerAndUser(),
    };
  };

  const getCauseChangeStatus = (options) =>
    options.userId
      ? options.cause
        ? options.cause
        : null
      : CRONJOB_NOTE_THREAD_CHANGE_STATUS;

  const _calculateMissCount = (options, thread) => {
    const prevThreadMissCount = thread.previous("missCount") || 0;
    if (
      options.fields.includes("status") &&
      thread.status === THREAD_STATUS_PROCESSING
    ) {
      return prevThreadMissCount;
    }

    if (
      options.fields.includes("status") &&
      thread.status !== THREAD_STATUS_PROCESSING
    ) {
      return -prevThreadMissCount;
    }

    const missCountChange =
      thread.status === THREAD_STATUS_SPAM
        ? 0
        : thread.missCount - prevThreadMissCount;
    return missCountChange;
  };

  const handleEmitThread = async function(thread, options) {
    const channel = await this.sequelize.models.Channel.findByPk(
      thread.channelId
    );

    if (!channel) return;

    // Should emit to CHANNEL_SOCKET_KEY:channelId if thread's changes should be listened by everyone
    //  => When Channel is broadcast channel, or thread's status change
    // Should emit to THREAD_SOCKET_KEY:threadId in other cases (only emit to people reponsible to the thread)
    const roomName =
      channel.isBroadcast() ||
      options.fields.includes("status") ||
      (thread.status !== THREAD_STATUS_PROCESSING &&
        options.fields.includes("lastMsgId"))
        ? getRoomName(CHANNEL_SOCKET_KEY, channel.id)
        : getRoomName(THREAD_SOCKET_KEY, thread.id);

    // calulate referentData for headerThread
    const referentData = {
      oStatus: thread.previous("status") || THREAD_STATUS_NEW,
      threadId: thread.id,
      channelId: channel.id,
      nStatus: thread.status,
    };

    // logging thread update
    options.fields.includes("status") &&
      this.sequelize.models.LogThread.create({
        ...referentData,
        userId: options.userId || EMPTY_USER,
        note: getCauseChangeStatus(options),
      });

    // TODO: updatedAt is not change after update.
    // Now, temporary fix by query thread again
    const newThread = await this.sequelize.models.Thread.scope(
      "withUsersServingAndHistory"
    ).findByPk(thread.id);
    // Don't want send missCount if thread has status that is unread and spam
    const missCountChange = _calculateMissCount(options, thread);
    io.of("/")
      .to(roomName)
      .emit(SOCKET_UPDATE_THREAD, {
        thread: {
          ...(await newThread.withLastMessage()),
          updatedFields: options.fields,
          referentData,
        },
        channel: {
          ...channel.toJSON(),
          missCountChange,
        },
      });
  };

  Thread.addHook("afterCreate", handleEmitThread);

  Thread.addHook("afterUpdate", "emitUpdateThreadToClient", handleEmitThread);

  return Thread;
};
