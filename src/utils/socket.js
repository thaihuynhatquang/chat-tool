import db from "models";
import io, {
  GET_ONLINE_USER_IDS,
  GET_SOCKET_IDS_BY_USER_IDS,
} from "config/socket";
import { flatten } from "utils/common";
import { PERMISSION_AUTO_RECEIVE_THREADS } from "constants";

export const getRoomName = (type, id) => `${type}:${id}`;

export const socketsJoinRoomBySocketIds = async (socketIds, roomName) => {
  const promises = socketIds.map((socketId) => {
    return new Promise((resolve) => {
      io.of("/").adapter.remoteJoin(socketId, roomName, () => {
        resolve(true);
      });
    });
  });
  return Promise.all(promises).then((arrayStatus) =>
    arrayStatus.every((status) => status === true)
  );
};

export const socketsJoinRoomByUserIds = async (userIds, roomName) => {
  const socketIds = await getSocketIdsByUserIds(userIds);
  const promises = socketsJoinRoomBySocketIds(socketIds, roomName);

  return promises.then(() => true).catch(() => false);
};

export const socketsLeaveRoomBySocketIds = async (socketIds, roomName) => {
  const promises = socketIds.map((socketId) => {
    return new Promise((resolve) => {
      io.of("/").adapter.remoteLeave(socketId, roomName, () => {
        resolve(true);
      });
    });
  });

  return Promise.all(promises).then((arrayStatus) =>
    arrayStatus.every((status) => status === true)
  );
};

export const socketsLeaveRoomByUserIds = async (userIds, roomName) => {
  const socketIds = await getSocketIdsByUserIds(userIds);
  const promises = socketsLeaveRoomBySocketIds(socketIds, roomName);

  return promises.then(() => true).catch(() => false);
};

export const getAssignableUserIdsOfChannel = async (channel) => {
  const userOnlineIds = await getOnlineUserIds();
  // Only get user has permission auto receive threads
  const permissionAutoReceiveThreads = await db.Permission.findOne({
    where: { key: PERMISSION_AUTO_RECEIVE_THREADS },
  });
  if (!permissionAutoReceiveThreads) return [];
  const roles = await permissionAutoReceiveThreads.getRoles({
    where: {
      channelId: channel.id,
    },
  });

  const users = await channel.getUsers({
    where: {
      id: {
        $in: userOnlineIds,
      },
    },
    include: [
      {
        model: db.Role,
        where: {
          id: {
            $in: roles.map((role) => role.id),
          },
          channel_id: channel.id,
        },
      },
    ],
  });
  return users.map((user) => user.id);
};

// Hook actions
export const getSocketIdsByUserIds = (userIds) =>
  emitCustomHookEvent({
    type: GET_SOCKET_IDS_BY_USER_IDS,
    payload: userIds,
  });

export const getOnlineUserIds = () =>
  emitCustomHookEvent({
    type: GET_ONLINE_USER_IDS,
  });

const emitCustomHookEvent = (request) =>
  new Promise((resolve, reject) => {
    io.of("/").adapter.customRequest(request, (err, replies) => {
      if (err) return reject(err);
      resolve(flatten(replies));
    });
  });
