import db from "models";
import { checkUserPermission } from "utils/authorize";

export const canAccessChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { id: userId } = req.user;
    const user = await db.User.findByPk(userId);
    if (!user) return res.sendStatus(404);
    const isUserInChannel = await user.hasChannel(parseInt(channelId));

    if (!isUserInChannel) return res.sendStatus(403);
    next();
  } catch (err) {
    next(err);
  }
};

export const can = (permissionKey) => async (req, res, next) => {
  try {
    let channelId = req.params.channelId;
    if (!channelId) {
      const { threadId } = req.params;
      const thread = await db.Thread.findByPk(threadId);
      if (thread) channelId = thread.channelId;
    }
    if (!channelId) return res.sendStatus(403);
    const canDo = await checkUserPermission(
      req.user.id,
      permissionKey,
      channelId
    );
    if (!canDo) return res.sendStatus(403);
    next();
  } catch (err) {
    next(err);
  }
};
