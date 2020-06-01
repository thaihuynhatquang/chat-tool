import { Router } from 'express';
import multer from 'multer';
import startChannels from 'core/startChannels';
import db from 'models';
import asyncMiddleware from 'routes/middlewares/asyncMiddleware';
import {
  THREAD_STATUS_UNREAD,
  THREAD_STATUS_PROCESSING,
  THREAD_STATUS_SPAM,
  THREAD_STATUS_DONE,
  CHANNEL_SOCKET_KEY,
} from 'constants';
import { getRoomName, getNextCursorMessage } from 'utils/common';
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

/**
 * @api {get} /threads/:threadId 0. Get detail of a Thread
 * @apiName GetThread
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId Thread unique ID
 * @apiSuccess {Number} channelId id of channel which thread belong to
 * @apiSuccess {String} uniqueKey Unique key with each thread (example: facebookId for facebook user)
 * @apiSuccess {String} title Title of thread
 * @apiSuccess {String} status Status of thread (UNREAD, PROCESSING, SPAM, DONE)
 * @apiSuccess {String} lastMsgId mid of Message
 * @apiSuccess {Number} missCount number of miss messages
 * @apiSuccess {DataTime} missTime Time of recieve message which is not anwsered
 * @apiSuccess {Object} additionData some extra information of channel
 * @apiSuccess {Object} lastMessage detail of last message in thread
 * @apiUse GetThreadResponse
 */
router.get(
  '/:threadId',
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;
    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.status(404).send('Can not find Thread');
    return res.json(await threadsWithLastMessage(thread));
  }),
);

/**
 * @api {get} /threads/:threadId/user-serving 1. Get users who is serving in this thread
 * @apiName GetThreadUserServing
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId Thread unique ID
 * @apiUse LimitOffset
 * @apiSuccess {Number} count total number of serving users
 * @apiSuccess {Array[]} data List all serving users. See <a href="#api-User-GetUser">user detail</a>
 * @apiUse GetThreadUserServingResponse
 */
router.get(
  '/:threadId/user-serving',
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const thread = await db.Thread.findByPk(req.params.threadId);
    if (!thread) return res.status(404).send('Thread not found');
    const [count, usersServing] = await Promise.all([
      thread.countUsersServing(),
      thread.getUsersServing({ limit, offset }),
    ]);
    return res.json({ count, data: usersServing });
  }),
);

/**
 * @api {get} /threads/:threadId/user-history 2. Get users who is served in this thread
 * @apiName GetThreadUserHistory
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId Thread unique ID
 * @apiUse LimitOffset
 * @apiSuccess {Number} count total number of history users
 * @apiSuccess {Array[]} data List all serving users. See <a href="#api-User-GetUser">user detail</a>
 * @apiUse GetThreadUserServingResponse
 */
router.get(
  '/:threadId/user-history',
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const thread = await db.Thread.findByPk(req.params.threadId);
    if (!thread) return res.status(404).send('Thread not found');
    const [count, usersHistory] = await Promise.all([
      thread.countUsersServing(),
      thread.getUsersHistory({ limit, offset }),
    ]);
    return res.json({ count, data: usersHistory });
  }),
);

/**
 * @api {get} /threads/:threadId/customer 3. Get list customer in thread
 * @apiName GetThreadCustomer
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId Thread unique ID
 * @apiParam {String} [name] String to filter customers by their name
 * @apiUse LimitOffset
 * @apiSuccess {Number} count total number of customers in thread
 * @apiSuccess {Array[]} data List all customers. See <a href="#api-Customer-GetCustomer">customer detail</a>
 * @apiUse GetCustomersResponse
 */
router.get(
  '/:threadId/customers',
  asyncMiddleware(async (req, res) => {
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
  }),
);

/**
 * @api {put} /threads/:threadId/status 4. Update status of a thread
 * @apiDescription Update status of a thread (unread, processing, done, spam) then broadcast thread instance to channel
 * @apiName ChangeThreadStatus
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId Thread unique ID
 * @apiParam {String} status Status of thread
 * @apiSuccess {Object} Result See <a href="#api-Thread-GetThread">API get detail of thread</a>
 */
router.put(
  '/:threadId/status',
  asyncMiddleware(async (req, res) => {
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
    const thread = await db.Thread.findOne({ where: { id: threadId } });
    if (!thread) return res.status(404).send('Can not find Thread');
    const threadWithLastMessage = await threadsWithLastMessage(thread);
    emitThreadUpdateStatus(req.io, getRoomName(CHANNEL_SOCKET_KEY, thread.channelId), {
      thread: threadWithLastMessage,
    });
    return res.json(threadWithLastMessage);
  }),
);

/**
 * @api {get} /threads/:threadId/messages 5. Get messages of a thread
 * @apiName GetThreadMessages
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId id of thread
 * @apiParam {Number} [limit] limit number of result
 * @apiParam {String} [nextCursor] cursor base
 * @apiSuccess {Number} count Total number of messages
 * @apiSuccess {Array[]} data List all messages
 * @apiSuccess {String} nextCursor cursor base to get next massge
 * @apiUse GetThreadMessagesResponse
 */
router.get(
  '/:threadId/messages',
  asyncMiddleware(async (req, res) => {
    const { limit, nextCursor } = req.query;
    const { threadId } = req.params;

    let where = { threadId, parentId: null };
    if (nextCursor) {
      // NOTE: decode cursor base
      const lastMessage = Buffer.from(nextCursor, 'base64').toString('utf8');
      const { mid: minId, msgCreatedAt: minMsgCreatedAt } = JSON.parse(lastMessage);
      where = {
        ...where,
        [Op.or]: [
          {
            msgCreatedAt: {
              [Op.lt]: minMsgCreatedAt,
            },
          },
          {
            msgCreatedAt: {
              [Op.eq]: minMsgCreatedAt,
            },
            mid: {
              [Op.lt]: minId,
            },
          },
        ],
      };
    }

    const [count, messages] = await Promise.all([
      db.Message.count({
        where: { threadId, parentId: null },
      }),
      db.Message.findAll({
        raw: true,
        where,
        order: [
          ['msgCreatedAt', 'DESC'],
          ['mid', 'DESC'],
        ],
        limit,
      }),
    ]);

    const mids = messages.map((msg) => msg.mid);

    if (mids.length === 0) return res.json({ count, data: messages });

    const [countReplies, msgReplies] = await Promise.all([
      db.sequelize.query(
        `SELECT
          parent_id as parentId, COUNT(*) as count
        FROM messages
        WHERE
          parent_id IN (:mids)
          AND thread_id = :threadId
        GROUP BY parent_id`,
        {
          replacements: {
            threadId,
            mids,
          },
          type: db.sequelize.QueryTypes.SELECT,
        },
      ),

      // Thank to Ivan Akimov: https://github.com/sequelize/sequelize/issues/9725
      db.sequelize.transaction(async (transaction) => {
        await db.sequelize.set({ message_rank: 0, current_mid: null }, { transaction });
        return db.sequelize.query(
          `SELECT
              mid,
              thread_id AS threadId,
              customer_id AS customerId,
              is_verified AS isVerified,
              user_id AS userId,
              parent_id AS parentId,
              processed,
              content,
              addition_data AS additionData,
              msg_created_at AS msgCreatedAt,
              msg_updated_at AS msgUpdatedAt,
              msg_deleted_at AS msgDeletedAt
          FROM
              (SELECT
                  *,
                  @message_rank:=IF(@current_mid = parent_id, @message_rank + 1, 1) AS message_rank,
                  @current_mid:=parent_id
              FROM
                  messages
              WHERE
                  parent_id IN (:mids) and thread_id = :threadId
              ORDER BY parent_id, msg_created_at DESC, mid DESC) ranked
          WHERE
              message_rank <= 5`,
          {
            replacements: { mids, threadId },
            transaction,
            type: db.sequelize.QueryTypes.SELECT,
          },
        );
      }),
    ]);

    const replies = await messagesWithCustomerAndUser(msgReplies);
    const msgWithReplies = messages.map((msg) => {
      const repliesMsg = replies.filter((reply) => reply.parentId === msg.mid);
      const countRepMsg = countReplies.find((countRep) => countRep.parentId === msg.mid);
      const count = countRepMsg ? countRepMsg.count : 0;
      msg.replies =
        repliesMsg.length !== 0
          ? {
              count,
              data: repliesMsg,
              nextCursor: getNextCursorMessage(repliesMsg, limit),
            }
          : null;
      return msg;
    });

    return res.json({
      count,
      data: await messagesWithCustomerAndUser(msgWithReplies),
      nextCursor: getNextCursorMessage(messages, limit),
    });
  }),
);

/**
 * @api {get} /threads/:threadId/messages/:mid 6. Get replies of messages
 * @apiName GetReplyMessages
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId Id of current Thread
 * @apiParam {String} mid mid (message id) of message
 * @apiParam {String} [nextCursor] cursor base
 * @apiParam {Number} [limit] limit result. Default: 10
 * @apiSuccess {Number} count total replies message
 * @apiSuccess {Object} data replies message
 * @apiSuccess {String} nextCursor cursor base to get next massge
 * @apiUse GetThreadMessagesResponse
 */
router.get(
  '/:threadId/messages/:mid',
  asyncMiddleware(async (req, res) => {
    const { mid, threadId } = req.params;
    const { limit, nextCursor } = req.query;
    let where = { parentId: mid, threadId };
    if (nextCursor) {
      // Decode cursor base
      const lastMessage = Buffer.from(nextCursor, 'base64').toString('utf8');
      const { mid: minId, msgCreatedAt: minMsgCreatedAt } = JSON.parse(lastMessage);
      where = {
        ...where,
        [Op.or]: [
          {
            msgCreatedAt: {
              [Op.lt]: minMsgCreatedAt,
            },
          },
          {
            msgCreatedAt: {
              [Op.eq]: minMsgCreatedAt,
            },
            mid: {
              [Op.lt]: minId,
            },
          },
        ],
      };
    }
    const [count, replies] = await Promise.all([
      db.Message.count({
        where: { parentId: mid },
      }),
      db.Message.findAll({
        where,
        order: [
          ['msgCreatedAt', 'DESC'],
          ['mid', 'DESC'],
        ],
        limit,
      }),
    ]);

    return res.json({
      count,
      data: replies,
      nextCursor: getNextCursorMessage(replies, limit),
    });
  }),
);

/**
 * @api {post} /threads/:threadId/messages 7. Send messages
 * @apiName SendMessages
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {String} message Message content
 * @apiParam {Number} threadId Id of current Thread
 * @apiParam {String} [parentId] parent_id of comment
 * @apiParam {File} attachment Attachment
 * @apiSuccess {Boolean} success true if send message successfull, otherwise false
 * @apiSuccess {Object} response Respone messages
 * @apiUse SendMessagesResponse
 */
router.post(
  '/:threadId/messages',
  upload.single('attachment'),
  asyncMiddleware(async (req, res) => {
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
  }),
);

/**
 * @api {get} /threads/:threadId/attachments 8. Get attachments of a thread (by type)
 * @apiDescription Get message include attachments data by one of these type: image | audio | video | file
 * @apiName GetAttachments
 * @apiGroup Thread
 * @apiVersion 1.0.0
 * @apiParam {Number} threadId Id of current Thread
 * @apiParam {String} [type=image] type of attachments
 * @apiParam {Number} [limit=100] limit number of return data
 * @apiParam {String} [nextCursor] Cursor base
 * @apiSuccess {Number} count Count number of messages which include attachment
 * @apiSuccess {Array[]} data List of data response
 * @apiUse GetAttachmentsResponse
 */
router.get(
  '/:threadId/attachments',
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;
    const { type = 'image', limit, nextCursor } = req.query;

    let minId = null;

    let minMsgCreatedAt = new Date();

    if (nextCursor) {
      const lastMessage = Buffer.from(nextCursor, 'base64').toString('utf8');
      const { mid, msgCreatedAt } = JSON.parse(lastMessage);
      minId = mid;
      minMsgCreatedAt = msgCreatedAt;
    }

    const nextCursorCondition = nextCursor
      ? 'AND (msg_created_at < :minMsgCreatedAt OR (msg_created_at = :minMsgCreatedAt AND mid < :minId))'
      : '';
    const [countData, messages] = await Promise.all([
      db.sequelize.query(
        `SELECT COUNT(*) as count
        FROM messages 
        WHERE 
          thread_id = :threadId
          AND 
          JSON_CONTAINS(addition_data->'$.attachments', JSON_OBJECT('type', :type)) = 1`,
        {
          replacements: { threadId, type },
          type: db.sequelize.QueryTypes.SELECT,
        },
      ),
      db.sequelize.query(
        `SELECT mid, addition_data as additionData, msg_created_at as msgCreatedAt
          FROM messages 
          WHERE 
              thread_id = :threadId
            ${nextCursorCondition}
            AND
              msg_deleted_at IS NULL 
            AND 
              JSON_CONTAINS(addition_data->'$.attachments', JSON_OBJECT('type', :type)) = 1
          ORDER BY msg_created_at DESC, mid DESC
          LIMIT :limit`,
        {
          replacements: {
            threadId,
            type,
            limit,
            minMsgCreatedAt,
            minId,
          },
          type: db.sequelize.QueryTypes.SELECT,
        },
      ),
    ]);

    const result = messages.map((msg) => {
      const {
        additionData: { attachments },
      } = msg;
      msg.additionData.attachments = attachments.filter((att) => att.type === type);
      return msg;
    });

    const count = countData.length === 0 ? 0 : countData[0].count;
    return res.json({
      count,
      data: result,
      nextCursor: getNextCursorMessage(messages, limit),
    });
  }),
);

export default router;
