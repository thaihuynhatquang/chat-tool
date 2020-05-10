import { Router } from 'express';
import multer from 'multer';
import startChannels from 'core/startChannels';
import db from 'models';
import {
  THREAD_STATUS_UNREAD,
  THREAD_STATUS_PROCESSING,
  THREAD_STATUS_SPAM,
  THREAD_STATUS_DONE,
  CHANNEL_SOCKET_KEY,
} from 'constants';

import { getRoomName } from 'utils/common';
import { threadsWithLastMessage, messagesWithCustomerAndUser } from 'utils/db';
import { emitThreadUpdateStatus } from 'utils/socket';

const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, '/tmp');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const router = new Router();
const Op = db.Sequelize.Op;

router.get('/:threadId', async (req, res) => {
  const { threadId } = req.params;
  const thread = await db.Thread.findByPk(threadId);
  if (!thread) return res.status(404).send('Can not find Thread');
  const threadWithLastMessage = await threadsWithLastMessage(thread);
  emitThreadUpdateStatus(req.io, getRoomName(CHANNEL_SOCKET_KEY, thread.channelId), { thread: threadWithLastMessage });
  return res.json(threadWithLastMessage);
});

router.get('/:threadId/user-serving', async (req, res) => {
  const { limit, offset } = req.query;
  const thread = await db.Thread.findByPk(req.params.threadId);
  if (!thread) return res.status(404).send('Thread not found');
  const [count, usersServing] = await Promise.all([
    thread.countUsersServing(),
    thread.getUsersServing({ limit, offset }),
  ]);
  return res.json({ count, data: usersServing });
});

router.get('/:threadId/user-history', async (req, res) => {
  const { limit, offset } = req.query;
  const thread = await db.Thread.findByPk(req.params.threadId);
  if (!thread) return res.status(404).send('Thread not found');
  const [count, usersHistory] = await Promise.all([
    thread.countUsersServing(),
    thread.getUsersHistory({ limit, offset }),
  ]);
  return res.json({ count, data: usersHistory });
});

router.get('/:threadId/customers', async (req, res) => {
  const { name = '', limit, offset } = req.query;
  const thread = await db.Thread.findByPk(req.params.threadId);
  if (!thread) return res.status(404).send('Thread not found');
  const channel = await thread.getChannel();
  const condition = {
    where: {
      name: {
        [Op.like]: `%${name}%`,
      },
      uniqueKey: {
        [Op.ne]: channel.uniqueKey,
      },
    },
  };
  const [count, customers] = await Promise.all([
    thread.countCustomers(condition),
    thread.getCustomers({
      ...condition,
      scope: 'withNotesAndTags',
      limit,
      offset,
    }),
  ]);
  return res.json({ count, data: customers });
});

router.put('/:threadId/status', async (req, res) => {
  const { status } = req.body;
  const { threadId } = req.params;
  if (![THREAD_STATUS_SPAM, THREAD_STATUS_DONE, THREAD_STATUS_PROCESSING, THREAD_STATUS_UNREAD].includes(status)) {
    return res.status(400).send('Unknown status');
  }
  await db.Thread.update(
    {
      status,
    },
    {
      where: { id: threadId },
    },
  );
  const thread = await db.Thread.findOne({ raw: true, where: { id: threadId } });
  thread.lastMessage = await getLastMessage(thread);
  return res.json(thread);
});

router.get('/:threadId/messages', async (req, res) => {
  const { limit, offset } = req.query;
  const { threadId } = req.params;
  const { count, rows: messages } = await db.Message.findAndCountAll({
    raw: true,
    where: { threadId },
    order: [['msgCreatedAt', 'DESC']],
    limit,
    offset,
  });

  return res.json({ count, data: await messagesWithCustomerAndUser(messages) });
});

router.post('/:threadId/messages', upload.single('attachment'), async (req, res) => {
  const {
    file: attachment,
    body: { parentId, message },
    params: { threadId },
    user: { id: userId },
  } = req;

  const sendData = { attachment, userId, parentId, message };
  if ((!attachment && !message) || !threadId) return res.sendStatus(400);

  const thread = await db.Thread.findByPk(threadId);

  if (!thread) return res.status(404).send('Thread not found');

  const { type, uniqueKey } = await db.Channel.findByPk(thread.channelId);

  sendData.target = thread.uniqueKey;

  const channels = await startChannels();
  const result = await channels[type][uniqueKey].sendMessage(sendData);

  if (!result.success) return res.status(400).json(result);
  return res.status(200).json(result);
});

export default router;
