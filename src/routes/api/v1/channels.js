import { Router } from 'express';
import _ from 'lodash';
import db from 'models';
import { threadsWithLastMessage } from 'utils/db';

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
  const { limit, nextCursor, status, isMiss, title, sort: sortCondition } = req.query;
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

  if (status) where = { ...where, status };
  if (isMiss === 'true') where = { ...where, missCount: { [Op.gt]: 0 } };

  let orders = [
    ['updatedAt', 'desc'],
    ['id', 'desc'],
  ];

  if (sortCondition) {
    orders = _.unionBy(
      [...sortCondition.map(JSON.parse).filter((order) => order[0] !== 'id'), ...orders],
      (item) => item[0],
    );
  }

  // NOTE format [updateAt, asc]
  const updatedAtSort = orders.find((order) => order[0] === 'updatedAt');
  const { isBroadcast } = channel.configs;
  let user;
  if (!isBroadcast) {
    user = await db.User.findByPk(req.user.id);
    where = { ...where, channelId: channel.id };
  }
  const whereCount = { ...where };

  // NOTE decode cursor
  if (nextCursor) {
    const lastThread = Buffer.from(nextCursor, 'base64').toString('utf8');
    const { id: minId, updatedAt: minUpdatedAt } = JSON.parse(lastThread);

    where = {
      ...where,
      [Op.or]: [
        {
          updatedAt: {
            [updatedAtSort[1] === 'desc' ? Op.lt : Op.gt]: minUpdatedAt,
          },
        },
        {
          updatedAt: {
            [Op.eq]: minUpdatedAt,
          },
          id: {
            [Op.lt]: minId,
          },
        },
      ],
    };
  }

  let [count, threads] = isBroadcast
    ? await Promise.all([
        channel.countThreads({ where: whereCount }),
        channel.getThreads({ where, order: orders, limit }),
      ])
    : await Promise.all([
        user.countThreadsServing({ where: whereCount }),
        user.getThreadsServing({ where, order: orders, limit }),
      ]);

  threads = await threadsWithLastMessage(threads);

  if (threads.length === 0) {
    return res.json({ count, data: threads });
  }

  // Create cursorbase
  const lastThread = threads[threads.length - 1];

  const encodeNextCursor = Buffer.from(JSON.stringify({ updatedAt: lastThread.updatedAt, id: lastThread.id })).toString(
    'base64',
  );

  return res.json({ count, data: threads, nextCursor: encodeNextCursor });
});

export default router;
