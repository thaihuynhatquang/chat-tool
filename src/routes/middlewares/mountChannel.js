import db from "models";

export default async (req, res, next) => {
  try {
    const { channelId, threadId } = req.params;
    let mountChannelId = channelId;
    if (!mountChannelId) {
      const thread = await db.Thread.findByPk(threadId);
      if (thread) mountChannelId = thread.channelId;
    }
    req.channel = mountChannelId
      ? await db.Channel.findByPk(mountChannelId)
      : null;
    next();
  } catch (err) {
    next(err);
  }
};
