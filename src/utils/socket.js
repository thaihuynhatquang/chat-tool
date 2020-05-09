import client from 'config/redis';
import { flatten } from 'utils/common';
import { NEW_MESSAGE_EVENT, UPDATE_THREAD_STATUS_EVENT } from 'constants';

export const getSocketIdsByUserId = async (userId) => {
  const socketIds = await client.lrangeAsync(userId, 0, -1);
  return socketIds;
};

export const socketsJoinRoom = async (io, usersServing, roomName) => {
  const socketIdsByUser = await Promise.all(
    usersServing.map(async (user) => ({
      userId: user.id,
      socketIds: await getSocketIdsByUserId(user.id),
    })),
  );
  const promises = socketIdsByUser.map(({ socketIds, userId }) => {
    return socketIds.map((socketId) => {
      return new Promise((resolve) => {
        io.of('/').adapter.remoteJoin(socketId, roomName, (error) => {
          if (error) {
            // NOTE: expired socketId then remove from redis
            client.lrem(userId, 0, socketId);
          }
          resolve(true);
        });
      });
    });
  });
  return Promise.all(flatten(promises)).then((arrayStatus) => arrayStatus.every((status) => status === true));
};

export const emitNewMessage = (io, roomName, data) => {
  io.of('/')
    .to(roomName)
    .emit(NEW_MESSAGE_EVENT, data);
};

export const emitThreadUpdateStatus = (io, roomName, data) => {
  io.of('/')
    .to(roomName)
    .emit(UPDATE_THREAD_STATUS_EVENT, data);
};
