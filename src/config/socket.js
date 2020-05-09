import db from 'models';
import client from 'config/redis';
import checkAuth from 'utils/authorize';
import { getCookieFromString, getRoomName } from 'utils/common';
import { CHANNEL_SOCKET_KEY } from 'constants';

const debug = require('debug')('app:socket');

export default (io) => {
  io.on('connection', function(socket) {
    socket.use(async (packet, next) => {
      try {
        const { accessToken, user } = socket;
        if (user) {
          socket.user = user;
          return next();
        }
        if (!accessToken) return next(new Error('Invalid token'));
        socket.user = await checkAuth(accessToken);
        return next();
      } catch (error) {
        next(error);
      }
    });
    socket.on('disconnect', async () => {
      await client.lrem(socket.user.id, 0, socket.id);
    });
  });

  io.use(async (socket, next) => {
    try {
      const { cookie: cookieString } = socket.handshake.headers;

      if (!cookieString) throw new Error('No cookie transmitted');

      const cookie = getCookieFromString(cookieString);

      const { access_token: accessToken } = cookie;
      socket.accessToken = accessToken;

      if (!accessToken) throw Error('No access token transmitted');

      const user = await db.User.findByPk((await checkAuth(accessToken)).id);
      const channels = await user.getChannels();
      const channelIds = channels.map((channel) => channel.id);

      channelIds.forEach((id) => socket.join(getRoomName(CHANNEL_SOCKET_KEY, id)));

      socket.user = user;

      await client.rpush(user.id, socket.id);

      return next();
    } catch (error) {
      debug('Something went wrong', error);
      return next(error);
    }
  });
};
