import { Router } from "express";
import { PERMISSION_UPDATE_CHANNEL } from "constants";
import db from "models";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";
import { checkUserPermission } from "utils/authorize";
import { isWorkingTime } from "utils/time";

const router = new Router();

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const [count, users] = await Promise.all([
      db.User.count(),
      db.User.scope("withRoles").findAll({ limit, offset }),
    ]);
    return res.json({ count, data: users });
  })
);

router.get(
  "/me",
  asyncMiddleware(async (req, res) => {
    const user = await db.User.scope([
      "withRoles",
      "withReceiveTransferThreads",
    ]).findByPk(req.user.id);
    return res.json(user);
  })
);

router.get(
  "/:userId",
  asyncMiddleware(async (req, res) => {
    const user = await db.User.scope("withRoles").findByPk(req.params.userId);
    return res.json(user);
  })
);

router.put(
  "/me",
  asyncMiddleware(async (req, res) => {
    const { user } = req;
    const { avatarUrl } = req.body;
    await user.update({
      avatarUrl,
    });
    const updatedUser = await db.User.scope("withRoles").findByPk(user.id);
    return res.json(updatedUser);
  })
);

router.put(
  "/channels/:channelId/configs",
  asyncMiddleware(async (req, res) => {
    const { user } = req;
    const { userId, configs } = req.body;
    const { channelId } = req.params;
    const channel = await db.Channel.findOne({
      where: { id: channelId },
    });
    if (!channel) return res.sendStatus(400);
    if (channel.configs.forceReceiveThreadsInWorkTime) {
      const isAdminUpdate = await checkUserPermission(
        user.id,
        PERMISSION_UPDATE_CHANNEL,
        channelId
      );
      if (
        !isAdminUpdate &&
        isWorkingTime(channel) &&
        configs.receiveAutoAssign === false
      ) {
        return res
          .status(400)
          .send("Cannot change receive threads in working time");
      }
    }
    const updatedUserId = userId || user.id;
    const channelUser = await db.ChannelUser.findOne({
      where: { channel_id: channelId, user_id: updatedUserId },
    });
    channelUser &&
      (await channelUser.update({
        configs: {
          ...channelUser.configs,
          ...configs,
        },
      }));
    return res.sendStatus(204);
  })
);

export default router;
