import { Router } from "express";
import _ from "lodash";
import db from "models";
import startChannels from "core/startChannels";
import io from "config/socket";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";
import {
  PERMISSION_READ_ALL_THREADS,
  PERMISSION_REMOVE_USER_FROM_CHANNEL,
  PERMISSION_CREATE_TAG,
  PERMISSION_UPDATE_USER_ROLE,
  PERMISSION_CREATE_INVITE_LINK,
  PERMISSION_UPDATE_CHANNEL,
  THREAD_STATUS_PROCESSING,
  CHANNEL_SOCKET_KEY,
  SOCKET_REFRESH_CHANNEL,
} from "constants";
import { getRoomName, getOnlineUserIds } from "utils/socket";
import { checkUserPermission } from "utils/authorize";
import { canAccessChannel, can } from "routes/middlewares/authorize";

const router = new Router();

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const { id: userId } = req.user;

    const user = await db.User.findByPk(userId);
    if (!user) return res.sendStatus(401);
    const [count, channels] = await Promise.all([
      user.countChannels(),
      user.getChannels({ raw: true, limit, offset }),
    ]);

    const missCountsByChannelId = await db.Channel.getMissCountsByUserId(
      userId
    );

    const channelsWithMissCount = channels.map((channel) => {
      return {
        ...channel,
        missCount: missCountsByChannelId[channel.id] || 0,
      };
    });
    return res.json({ count, data: channelsWithMissCount });
  })
);

router.get(
  "/:channelId",
  canAccessChannel,
  asyncMiddleware(async (req, res) => {
    const { id: userId } = req.user;
    const { channelId } = req.params;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.status(404).send(`Can not find channel`);
    return res.json({
      ...channel.toJSON(),
      missCount: await channel.getMissCountByUserId(userId),
    });
  })
);

router.get(
  "/:channelId/users",
  canAccessChannel,
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const { channelId } = req.params;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.status(404).send(`Can not find channel`);
    const [count, users] = await Promise.all([
      channel.countUsers(),
      channel.getUsersWithRolePermission(channelId, limit, offset),
    ]);
    const onlineUserIds = await getOnlineUserIds();
    const usersWithAdditionInfo = await Promise.all(
      users.map(async (user) => {
        const isOnline =
          onlineUserIds &&
          onlineUserIds.find((onlineUser) => onlineUser === user.id);
        const threadsCount = await user.countThreadsServing({
          where: { channelId, status: THREAD_STATUS_PROCESSING },
        });
        return { ...user.toJSON(), isOnline, threadsCount };
      })
    );
    return res.json({ count, data: usersWithAdditionInfo });
  })
);

// TODO: Using invite link
router.post(
  "/:channelId/users",
  asyncMiddleware(async (req, res) => {
    const { userId } = req.body;
    const { channelId } = req.params;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).send("Can not find channel");
    }
    await channel.addUser(userId);
    return res.json({ channelId: channel.id, userId });
  })
);

router.delete(
  "/:channelId/users",
  can(PERMISSION_REMOVE_USER_FROM_CHANNEL),
  asyncMiddleware(async (req, res) => {
    const userId = req.body.userId;
    const { channelId } = req.params;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).send("Can not find channel or user");
    }
    await channel.removeUser(userId);
    return res.sendStatus(204);
  })
);

router.get(
  "/:channelId/threads",
  canAccessChannel,
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const {
      limit,
      nextCursor,
      status,
      isMiss,
      isMine,
      title,
      sort: sortCondition,
    } = req.query;
    const { id: userId } = req.user;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.status(404).send("Can not find channel");

    let where = { deletedAt: null };

    if (typeof title === "string") {
      where = {
        ...where,
        title: {
          $like: `%${title}%`,
        },
      };
    }

    if (status) where = { ...where, status };
    if (isMiss === "true") where = { ...where, missCount: { $gt: 0 } };

    let orders = [
      ["lastMsgAt", "desc"],
      ["id", "desc"],
    ];

    if (Array.isArray(sortCondition)) {
      orders = _.unionBy(
        [
          ...sortCondition
            .map((string) => JSON.parse(string))
            .filter((order) => order[0] !== "id"),
          ...orders,
        ],
        (item) => item[0]
      );
    }

    // Format [updateAt, asc]
    const lastMsgAtSort = orders.find((order) => order[0] === "lastMsgAt");
    const { isBroadcast } = channel.configs;

    const canReadAllThreads = await checkUserPermission(
      userId,
      PERMISSION_READ_ALL_THREADS,
      channelId
    );
    const isGetAllThreads =
      (isBroadcast ||
        status !== THREAD_STATUS_PROCESSING ||
        canReadAllThreads) &&
      isMine === "false";

    const whereCount = isGetAllThreads ? { ...where } : { ...where, channelId };

    // Decode cursor
    if (typeof nextCursor === "string") {
      const lastThread = Buffer.from(nextCursor, "base64").toString("utf8");
      const { id: minId, lastMsgAt: minLastMsgAt } = JSON.parse(lastThread);

      where = {
        ...where,
        $or: [
          {
            lastMsgAt: {
              [lastMsgAtSort && lastMsgAtSort[1] === "desc"
                ? "$lt"
                : "$gt"]: minLastMsgAt,
            },
          },
          {
            lastMsgAt: {
              $eq: minLastMsgAt,
            },
            id: {
              $lt: minId,
            },
          },
        ],
      };
    }

    let count, threads;
    if (!isGetAllThreads) {
      const user = await db.User.findByPk(userId);
      if (!user) return res.sendStatus(401);
      where = { ...where, channelId };
      count = await user.countThreadsServing({ where: whereCount });
      threads = await user.getThreadsServing({
        where,
        order: orders,
        limit,
        scope: "withUsersServingAndHistory",
      });
    } else {
      count = await channel.countThreads({ where: whereCount });
      threads = await channel.getThreads({
        where,
        order: orders,
        limit,
        scope: "withUsersServingAndHistory",
      });
    }

    threads = await db.Thread.joinLastMessage(threads);

    if (threads.length === 0) {
      return res.json({ count, data: threads });
    }

    // Create cursorbase
    const lastThread = threads[threads.length - 1];

    const encodeNextCursor = Buffer.from(
      JSON.stringify({ lastMsgAt: lastThread.lastMsgAt, id: lastThread.id })
    ).toString("base64");

    return res.json({ count, data: threads, nextCursor: encodeNextCursor });
  })
);

router.get(
  "/:channelId/tags",
  canAccessChannel,
  asyncMiddleware(async (req, res) => {
    const { content = "", limit, offset } = req.query;
    const { channelId } = req.params;
    const { rows: tags, count } = await db.Tag.findAndCountAll({
      where: {
        ...(content ? { content: { $like: `%${content.toString()}%` } } : {}),
        channelId,
      },
      limit,
      offset,
    });
    return res.json({ count, data: tags });
  })
);

router.post(
  "/:channelId/tags",
  can(PERMISSION_CREATE_TAG),
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const { content, color } = req.body;
    const {
      user: { id: creator },
    } = req;

    const tag = await db.Tag.create({
      channelId,
      content,
      color,
      creator,
    });
    return res.json(tag);
  })
);

router.get(
  "/:channelId/roles",
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const [count, roles] = await Promise.all([
      db.Role.count({ where: { channelId } }),
      db.Role.findAll({ include: [db.Permission], where: { channelId } }),
    ]);
    return res.json({ count, data: roles });
  })
);

router.put(
  "/:channelId/roles",
  can(PERMISSION_UPDATE_USER_ROLE),
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const { roleIds, userId } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).send("Can not find user");
    const oldRoles = await user.getRoles({ where: { channelId } });
    await user.removeRoles(oldRoles);
    await user.addRoles(roleIds);

    return res.sendStatus(204);
  })
);

router.post(
  "/:channelId/invitation-link",
  can(PERMISSION_CREATE_INVITE_LINK),
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const { roleIds, expireTime } = req.body;
    const token = signature.signWithExpire(
      {
        roleIds: roleIds.map((id) => parseInt(id)),
        channelId,
      },
      parseInt(expireTime)
    );
    return res.json({
      link: `${req.protocol}://${req.get(
        "host"
      )}/api/invitation-link?token=${token}`,
    });
  })
);

router.put(
  "/:channelId",
  can(PERMISSION_UPDATE_CHANNEL),
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.sendStatus(404);

    const configKeys = Object.keys(channel.configs);
    const additionDataKeys = Object.keys(channel.additionData);

    const { title, configs, additionData } = req.body;

    if (title && channel.title !== title) {
      channel.set("title", title);
    }

    if (configs && configs.accessToken) {
      const _channels = await startChannels();
      const _channel = _channels[channel.type][channel.uniqueKey];
      if (_channel) {
        _channel.updateAccessToken(configs.accessToken);
      }
    }

    const update = (field, data, fieldKeys) => {
      let updatedField = channel[field];
      if (!data) return;
      Object.keys(data).map((key) => {
        if (
          !fieldKeys.includes(key) ||
          (fieldKeys.includes(key) &&
            typeof data[key] === typeof channel[field][key])
        ) {
          updatedField = _.merge(updatedField, { [key]: data[key] });
        }
      });
      channel.set(field, updatedField);
    };

    update("configs", configs, configKeys);
    update("additionData", additionData, additionDataKeys);

    await channel.save();
    return res.json(channel);
  })
);

router.get(
  "/:channelId/recover",
  can(PERMISSION_UPDATE_CHANNEL),
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.sendStatus(404);

    const instantChannels = await startChannels();
    const instance = instantChannels[channel.type][channel.uniqueKey];
    if (!instance) return res.sendStatus(404);
    const updateChannel = await instance.reloadChannel(channel);
    res.json({ dataUpdated: updateChannel.additionData.avatarUrl });
  })
);

router.get(
  "/:channelId/status-thread-count",
  asyncMiddleware(async (req, res) => {
    const { id: userId } = req.user;
    const { channelId } = req.params;

    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.status(404).send("Can not find channel");

    const { isBroadcast } = channel.configs;

    const canReadAllThreads = await checkUserPermission(
      userId,
      PERMISSION_READ_ALL_THREADS,
      channelId
    );
    const isGetAllThreads = isBroadcast || canReadAllThreads;

    const [processing, statuses] = await Promise.all([
      ...(isGetAllThreads
        ? [
            channel.countThreads({
              where: { status: THREAD_STATUS_PROCESSING },
            }),
          ]
        : [
            req.user.countThreadsServing({
              where: { status: THREAD_STATUS_PROCESSING, channelId },
            }),
          ]),
      db.Thread.findAll({
        where: { channelId, status },
        group: ["status"],
        attributes: ["status", [db.sequelize.fn("COUNT", "status"), "count"]],
      }),
    ]);

    res.json({
      status: statuses.reduce(
        (acc, item) => {
          acc[item.status] = item.dataValues.count;
          return acc;
        },
        { processing }
      ),
    });
  })
);

router.post(
  "/:channelId/refresh",
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    io.of("/")
      .to(getRoomName(CHANNEL_SOCKET_KEY, parseInt(channelId)))
      .emit(SOCKET_REFRESH_CHANNEL);
    res.sendStatus(200);
  })
);

export default router;
