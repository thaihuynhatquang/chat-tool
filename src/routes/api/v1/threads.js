import { Router } from 'express';
import multer from 'multer';
import startChannels from 'core/startChannels';
import db from 'models';
import client from 'config/redis';

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
  let thread = await db.Thread.findOne({ raw: true, where: { id: threadId } });
  if (!thread) return res.status(404).send('Can not find Thread');
  const threadInfo = JSON.parse(await client.getAsync(`threadInfo:${thread.id}`));
  thread = { ...thread, ...threadInfo };
  if (thread.lastMessage) {
    const customer = await db.Customer.findByPk(thread.lastMessage.customerId);
    thread = { ...thread, lastMessage: { ...thread.lastMessage, customer } };
  }
  return res.json(thread);
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
  const { limit, offset } = req.query;
  const thread = await db.Thread.findByPk(req.params.threadId);
  if (!thread) return res.status(404).send('Thread not found');
  const [count, customers] = await Promise.all([thread.countCustomers(), thread.getCustomers({ limit, offset })]);
  return res.json({ count, data: customers });
});

router.put('/:threadId/status', async (req, res) => {
  const { status } = req.body;
  const { threadId } = req.params;
  await db.Thread.update(
    {
      status,
    },
    {
      where: { id: threadId },
    },
  );
  const thread = await db.Thread.findByPk(threadId);
  if (!thread) return res.status(404).send('Can not find thread');
  return res.json(thread);
});

router.get('/:threadId/messages', async (req, res) => {
  const { limit, offset } = req.query;
  const { threadId } = req.params;
  const messages = await db.Message.findAndCountAll({
    raw: true,
    where: { threadId },
    limit,
    offset,
  });

  const customersIdList = [...new Set(messages.rows.map((msg) => msg.customerId))];

  const customers = await db.Customer.findAll({
    where: { id: { [Op.in]: customersIdList } },
  });

  const data = messages.rows.map((msg) => {
    return {
      ...msg,
      customer: customers.find((el) => el.id === msg.customerId),
    };
  });
  return res.json({ count: messages.count, data });
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
