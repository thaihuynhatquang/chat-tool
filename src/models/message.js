import _ from "lodash";
import io from "config/socket";
import {
  SOCKET_NEW_MESSAGE,
  CHANNEL_SOCKET_KEY,
  THREAD_SOCKET_KEY,
} from "constants";
import { PERMISSION_READ_ALL_THREADS } from "constants";
import { getUsersByPermission } from "utils/authorize";
import { getRoomName, socketsJoinRoomByUserIds } from "utils/socket";

const joinCustomerAndUser = async (db, messages) => {
  const customerIds = messages
    .filter((message) => message.customerId)
    .map((message) => message.customerId);
  const userIds = messages
    .filter((message) => message.userId)
    .map((message) => message.userId);

  const [customers, users] = await Promise.all([
    db.Customer.findAll({ raw: true, where: { id: customerIds } }),
    userIds.length > 0
      ? db.User.findAll({ raw: true, where: { id: userIds } })
      : [],
  ]);

  const result = messages.map((message) => {
    const messageToJSON = message.toJSON ? message.toJSON() : message;
    return {
      ...messageToJSON,
      customer: customers.find((item) => item.id === message.customerId),
      user: message.userId
        ? users.find((item) => item.id === message.userId)
        : null,
    };
  });

  return result;
};

export default (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      mid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      threadId: {
        allowNull: false,
        primaryKey: true,
        field: "thread_id",
        type: DataTypes.INTEGER,
      },
      customerId: {
        allowNull: false,
        field: "customer_id",
        type: DataTypes.INTEGER,
      },
      isVerified: {
        allowNull: false,
        field: "is_verified",
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        field: "user_id",
        type: DataTypes.INTEGER,
      },
      parentId: {
        field: "parent_id",
        type: DataTypes.STRING,
      },
      processed: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hidden: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
      additionData: {
        field: "addition_data",
        type: DataTypes.JSON,
      },
      msgCreatedAt: {
        field: "msg_created_at",
        type: "TIMESTAMP",
      },
      msgUpdatedAt: {
        field: "msg_updated_at",
        type: "TIMESTAMP",
      },
      msgDeletedAt: {
        field: "msg_deleted_at",
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "messages",
      timestamps: false,
    }
  );

  Message.joinCustomerAndUser = async function(inp) {
    const db = this.sequelize.models;
    const isArray = Array.isArray(inp);
    const messages = isArray ? inp : [inp];
    const messagesWithCustomerAndUser = await joinCustomerAndUser(db, messages);

    return isArray
      ? messagesWithCustomerAndUser
      : messagesWithCustomerAndUser[0];
  };

  Message.withCustomerAndUser = async function(options) {
    const db = this.sequelize.models;
    const messages = await this.findAll(options);
    return joinCustomerAndUser(db, messages);
  };

  Message.prototype.withCustomerAndUser = async function() {
    const db = this.sequelize.models;
    const customerPromise = db.Customer.findByPk(this.customerId);
    const userPromise = this.userId ? db.User.findByPk(this.userId) : null;

    const customer = await customerPromise;
    const user = await userPromise;

    return {
      ...this.toJSON(),
      customer: customer ? customer.toJSON() : null,
      user: user ? user.toJSON() : null,
    };
  };

  Message.addHook("afterCreate", "emitNewMessageToClient", async (message) => {
    const db = message.sequelize.models;
    const thread = await db.Thread.findByPk(message.threadId);
    if (!thread) return;
    const channel = await db.Channel.findByPk(thread.channelId);
    if (!channel) return;

    const roomName =
      channel.configs && channel.configs.isBroadcast
        ? getRoomName(CHANNEL_SOCKET_KEY, channel.id)
        : getRoomName(THREAD_SOCKET_KEY, thread.id);

    const usersServing = thread.getUsersServing();
    const usersCanReadAllThreads = getUsersByPermission(
      PERMISSION_READ_ALL_THREADS,
      thread.channelId
    );

    const userIds = _.uniq(
      (await usersServing)
        .concat(await usersCanReadAllThreads)
        .map((user) => user.id)
    );

    await socketsJoinRoomByUserIds(userIds, roomName);

    io.of("/")
      .to(roomName)
      .emit(SOCKET_NEW_MESSAGE, {
        message: await message.withCustomerAndUser(),
      });
  });

  return Message;
};
