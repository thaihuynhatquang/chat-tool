import { Router } from 'express';
import _ from 'lodash';
import db from 'models';
import { threadsWithLastMessage } from 'utils/db';
import asyncMiddleware from 'routes/middlewares/asyncMiddleware';

const router = new Router();
const Op = db.Sequelize.Op;

/**
 * @api {get} /channels 0. Get all channels which user can see
 * @apiName GetChannels
 * @apiGroup Channel
 * @apiVersion 1.0.0
 * @apiUse LimitOffset
 * @apiSuccess {Number} count Total number of channels which user can see
 * @apiSuccess {Array[]} data List all channels. See <a href="#api-Channel-GetChannel">channel detail</a> for more detail
 * @apiUse GetChannelsResponse
 */
router.get(
  '/',
  asyncMiddleware(async (req, res) => {
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
  }),
);

/**
 * @api {get} /channels/:channelId 1. Get detail of a channel
 * @apiName GetChannel
 * @apiGroup Channel
 * @apiVersion 1.0.0
 * @apiParam {Number} channelId Channel unique ID
 * @apiSuccess {Number} id of channel
 * @apiSuccess {String} uniqueKey Unique key with each channel (example: pageId for facebook fanpage)
 * @apiSuccess {String} type Type of channel (messenger, post,...)
 * @apiSuccess {String} title Title of channel
 * @apiSuccess {Object} configs Configs of the channel
 * @apiSuccess {Object} additionData Some extra infomation of the channel (avatarUrl, facebookUrl,...)
 * @apiSuccess {DateTime} createdAt The time which channel was created
 * @apiSuccess {DateTime} updatedAt The time which channel was updated
 * @apiSuccess {Number} missCount Number miss messages of channel
 * @apiUse GetChannelResponse
 */
router.get(
  '/:channelId',
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.status(404).send(`Can not find channel`);
    return res.json({
      ...channel.dataValues,
      missCount: await channel.getMissCountByUserId(req.user.id),
    });
  }),
);

/**
 * @api {get} /channels/:channelId/users 3. Get all user of a channel
 * @apiName GetChannelUser
 * @apiGroup Channel
 * @apiVersion 1.0.0
 * @apiUse LimitOffset
 * @apiParam {Number} channelId Channel unique ID
 * @apiSuccess {Number} count Number user of channel
 * @apiSuccess {Array[]} data List users of channel.<br/>See <a href="#api-User-GetUser">user detail</a>
 * @apiUse GetChannelUserResponse
 */
router.get(
  '/:channelId/users',
  asyncMiddleware(async (req, res) => {
    const { channelId } = req.params;
    const { limit, offset } = req.body;
    const channel = await db.Channel.findByPk(channelId);
    if (!channel) return res.status(404).send(`Can not find channel`);
    const [count, users] = await Promise.all([channel.countUsers(), channel.getUsers({ limit, offset })]);
    return res.json({ count, data: users });
  }),
);

const getChannelUser = async (req) => {
  const { userId } = req.body;
  const { channelId } = req.params;
  const [channel, user] = await Promise.all([db.Channel.findByPk(channelId), db.User.findByPk(userId)]);
  return [channel, user];
};

/**
 * @api {post} /channels/:channelId/users 4. Add user to channel
 * @apiGroup Channel
 * @apiName AddChannelUser
 * @apiVersion 1.0.0
 * @apiParam {Number} channelId Channel unique ID
 * @apiParam {Number} userId User unique ID
 * @apiUse AddChannelUserResponse
 */
router.post(
  '/:channelId/users',
  asyncMiddleware(async (req, res) => {
    const [channel, user] = await getChannelUser(req);
    if (!user || !channel) {
      return res.status(404).send('Can not find channel or user');
    }
    await channel.addUser(user);
    return res.json({ channelId: channel.id, userId: user.id });
  }),
);

/**
 * @api {delete} /channels/:channelId/users 5. Remove user from channel
 * @apiGroup Channel
 * @apiName RemoveChannelUser
 * @apiVersion 1.0.0
 * @apiParam {Number} channelId Channel unique ID
 * @apiParam {Number} userId User unique ID
 */
router.delete(
  '/:channelId/users',
  asyncMiddleware(async (req, res) => {
    const [channel, user] = await getChannelUser(req);
    if (!user || !channel) {
      return res.status(404).send('Can not find channel or user');
    }
    await channel.removeUser(user);
    return res.sendStatus(204);
  }),
);

/**
 * @api {get} /channels/:channelId/threads 2. Get Threads of a channel
 * @apiGroup Channel
 * @apiName GetChannelThreads
 * @apiParam {String} [status] Status of Thread
 * @apiParam {String} [title] Thread title
 * @apiParam {String} [sort] example ?sort=title_asc,createdAt_dsc. Default: ?sort=updatedAt_desc
 * @apiSuccess {Number} count Total number of threads
 * @apiSuccess {Array[]} data List all threads.<br/>See <a href="#api-Thread-GetThread">thread detail</a>
 * @apiSuccess {String} nextCursor cursor base to next threads
 * @apiUse GetChannelThreadsResponse
 */
router.get(
  '/:channelId/threads',
  asyncMiddleware(async (req, res) => {
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

    const encodeNextCursor = Buffer.from(
      JSON.stringify({ updatedAt: lastThread.updatedAt, id: lastThread.id }),
    ).toString('base64');

    return res.json({ count, data: threads, nextCursor: encodeNextCursor });
  }),
);

export default router;
