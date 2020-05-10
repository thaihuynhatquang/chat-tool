import { Router } from 'express';
import db from 'models';

const router = new Router();
const Op = db.Sequelize.Op;

router.get('/', async (req, res) => {
  const { limit, offset } = req.query;
  const user = await db.User.findByPk(req.user.id);
  let [count, channels] = await Promise.all([user.countChannels(), user.getChannels({ raw: true, limit, offset })]);

  const missCountsByChannelId = await db.Channel.getMissCountsByUserId(user.id);

  channels = channels.map((channel) => {
    return {
      ...channel,
      missCount: missCountsByChannelId[channel.id] || 0,
    };
  });
  return res.json({ count, data: channels });
});

router.get('/:channelId', async (req, res) => {
  const { channelId } = req.params;
  const channel = await db.Channel.findByPk(channelId);
  if (!channel) return res.status(404).send(`Can not find channel`);
  return res.json({
    ...channel.dataValues,
    // TODO: calculate missCount for channel
    missCount: await channel.getMissCountByUserId(req.user.id),
  });
});

router.get('/:channelId/users', async (req, res) => {
  const { channelId } = req.params;
  const { limit, offset } = req.body;
  const channel = await db.Channel.findByPk(channelId);
  if (!channel) return res.status(404).send(`Can not find channel`);
  const [count, users] = await Promise.all([channel.countUsers(), channel.getUsers({ limit, offset })]);
  return res.json({ count, data: users });
});

const getChannelUser = async (req) => {
  const { userId } = req.body;
  const { channelId } = req.params;
  const [channel, user] = await Promise.all([db.Channel.findByPk(channelId), db.User.findByPk(userId)]);
  return [channel, user];
};

router.post('/:channelId/users', async (req, res) => {
  const [channel, user] = await getChannelUser(req);
  if (!user || !channel) {
    return res.status(404).send('Can not find channel or user');
  }
  await channel.addUser(user);
  return res.json({ channelId: channel.id, userId: user.id });
});

router.delete('/:channelId/users', async (req, res) => {
  const [channel, user] = await getChannelUser(req);
  if (!user || !channel) {
    return res.status(404).send('Can not find channel or user');
  }
  await channel.removeUser(user);
  return res.sendStatus(204);
});

router.get('/:channelId/threads', async (req, res) => {
  const { channelId } = req.params;
  const { limit, offset, status, isMiss, title, sort } = req.query;
  const channel = await db.Channel.findByPk(channelId);
  if (!channel) res.status(404).send('Can not find channel');

  let where = {};
  if (title) {
    where = {
      ...where,
      [Op.and]: [
        {
          title: {
            [Op.like]: `%${title}%`,
          },
        },
      ],
    };
  }
  if (isMiss === 'true') where = { ...where, missCount: { [Op.gt]: 0 } };
  let order = [['updatedAt', 'desc']];

  if (sort) {
    order = [];
    const sortCondition = sort.split(',');
    sortCondition.forEach((element) => {
      const [field, atr] = element.split('_');
      order.push([field, atr]);
    });
  }

  let [count, threads] = await Promise.all([
    channel.countThreads({ where, order }),
    channel.getThreads({ raw: true, where, order, limit, offset }),
  ]);

  threads = await Promise.all(
    threads.map(async (thread) => {
      const lastMessage = await db.Message.findOne({
        raw: true,
        where: { mid: thread.lastMsgId, threadId: thread.id },
      });
      const { dataValues: customer } = await db.Customer.findByPk(lastMessage.customerId);
      return { ...thread, lastMessage: { ...lastMessage, customer } };
    }),
  );

  return res.json({ count, data: threads });
});

export default router;
