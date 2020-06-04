import { Router } from "express";
import db from "models";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";
import startChannels from "core/startChannels";

const router = new Router();

router.put(
  "/:mid",
  asyncMiddleware(async (req, res) => {
    const { mid } = req.params;
    const message = await db.Message.findOne({ where: { mid } });
    if (!message) return res.sendStatus(404);
    const { threadId } = message;
    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.sendStatus(404);
    const channel = await db.Channel.findByPk(thread.id);
    if (!channel) return res.sendStatus(404);
    const { type, uniqueKey } = channel;
    const channels = await startChannels();
    if (!channels[type][uniqueKey]) return res.sendStatus(404);
    await channels[type][uniqueKey].reloadMessage(message);
    return res.json(message);
  })
);

router.get(
  "/:messageId/recover",
  asyncMiddleware(async (req, res) => {
    const { messageId } = req.params;

    const message = await db.Message.findOne({ where: { mid: messageId } });
    if (!message) return res.sendStatus(404);

    const thread = await db.Thread.findByPk(message.threadId);
    if (!thread) return res.sendStatus(404);

    const channel = await db.Channel.findByPk(thread.channelId);
    if (!channel) return res.sendStatus(404);

    const instantChannels = await startChannels();
    const instance = instantChannels[channel.type][channel.uniqueKey];
    if (!instance) return res.sendStatus(404);
    const updateMessage = await instance.reloadMessage(message);

    res.json({
      dataUpdated: updateMessage.additionData
        ? updateMessage.additionData.attachments
          ? updateMessage.additionData.attachments
          : []
        : [],
    });
  })
);

router.put(
  "/:messageId/clear-miss",
  asyncMiddleware(async (req, res) => {
    const { messageId } = req.params;

    const message = await db.Message.findOne({ where: { mid: messageId } });
    if (!message) return res.sendStatus(404);

    const thread = await db.Thread.findByPk(message.threadId);
    if (!thread) return res.sendStatus(404);

    const channel = await db.Channel.findByPk(thread.channelId);
    if (!channel) return res.sendStatus(404);

    const instantChannels = await startChannels();
    const instance = instantChannels[channel.type][channel.uniqueKey];
    if (!instance) return res.sendStatus(404);

    await message.update({
      processed: !message.processed,
    });
    await instance.clearMissMessage(message, thread);

    res.sendStatus(200);
  })
);
export default router;
