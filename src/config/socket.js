import {
  CHANNEL_SOCKET_KEY,
  NODE_APP_INSTANCE,
  USER_SOCKET_KEY,
} from "constants";
import socketIO from "socket.io";
import redisAdapter from "socket.io-redis";
import checkAuth from "utils/authenticate";
import { getCookieFromString } from "utils/common";
import { currentTime } from "utils/logging";
import { getRoomName } from "utils/socket";

const debug = require("debug")("app:socket");
const io = socketIO();

const logOnlineStatus = (socket, status) => {
  console.info(
    `[LOG-ONLINE][${socket.user.id}][${
      socket.user.name
    }][${status.toUpperCase()}][${currentTime()}][${socket.id}]`
  );
};

io.adapter(redisAdapter({ host: process.env.REDIS_HOST || "localhost" }));

io.use((socket, next) => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const { cookie: cookieString } = socket.handshake.headers;

      if (!cookieString) throw new Error("No cookie transmitted");

      const cookie = getCookieFromString(cookieString);

      const { access_token: accessToken } = cookie;
      if (!accessToken) throw Error("No access token transmitted");

      socket.accessToken = accessToken;

      const user = await checkAuth(accessToken);
      if (!user)
        throw new Error("No user was found when checking authenticate");
      socket.user = user;
      logOnlineStatus(socket, "connect");

      const channels = await user.getChannels();
      const channelIds = channels.map((channel) => channel.id);
      channelIds.forEach((id) =>
        socket.join(getRoomName(CHANNEL_SOCKET_KEY, id))
      );
      socket.join(getRoomName(USER_SOCKET_KEY, user.id));
      resolve();
    } catch (err) {
      reject(err);
    }
  });

  promise
    .then(() => next())
    .catch((err) => {
      debug("Something went wrong in IO handshake", err);
      next(err);
    });
});

io.on("connection", (socket) => {
  debug(
    "New socket connection with id",
    socket.id,
    "in cluster instance",
    NODE_APP_INSTANCE
  );
  socket.use((packet, next) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const { accessToken } = socket;
        if (!accessToken) throw new Error("Invalid or empty access token");
        const user = await checkAuth(accessToken);
        if (!user) throw new Error("No user was found with socket");

        socket.user = user;
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    promise
      .then(() => next())
      .catch((err) => {
        debug("Something went wrong in socket handshake", err);
        next(err);
      });
  });

  socket.on("disconnect", () => {
    const { user } = socket;
    if (user) {
      logOnlineStatus(socket, "disconnect");
      user.update("lastLoginAt", new Date());
      user.save();
    }
  });
});

io.of("/").adapter.customHook = (hookAction, callback) => {
  hooks[hookAction.type] && typeof hooks[hookAction.type] === "function"
    ? callback(hooks[hookAction.type](hookAction.payload))
    : callback();
};
export const GET_SOCKET_IDS_BY_USER_IDS = "GET_SOCKET_IDS_BY_USER_IDS_HOOK";
export const GET_ONLINE_USER_IDS = "GET_ONLINE_USER_IDS_HOOK";

const hooks = {
  [GET_SOCKET_IDS_BY_USER_IDS]: (userIds) => {
    const socketIds = Object.keys(io.sockets.sockets).filter((id) => {
      const sk = io.nsps["/"].connected[id];
      return userIds.includes(sk.user.id);
    });

    return socketIds || [];
  },
  [GET_ONLINE_USER_IDS]: () => {
    const userOnlineIds = Object.keys(io.sockets.sockets).map((id) => {
      const sk = io.nsps["/"].connected[id];
      return sk.user.id;
    });
    return [...new Set(userOnlineIds)];
  },
};

export default io;
