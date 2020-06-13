import { Router } from "express";
import multer from "multer";
import db from "models";
import io from "config/socket";
import startChannels from "core/startChannels";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";
import mountChannel from "routes/middlewares/mountChannel";
import { can } from "routes/middlewares/authorize";
import {
  THREAD_STATUS_UNREAD,
  THREAD_STATUS_PROCESSING,
  THREAD_STATUS_SPAM,
  THREAD_STATUS_DONE,
  PERMISSION_SEND_MESSAGE,
  THREAD_SOCKET_KEY,
  USER_SOCKET_KEY,
  SOCKET_TRANSFER_THREAD,
  PERMISSION_READ_HIDDEN_MESSAGES,
  PERMISSION_UPDATE_CHANNEL,
} from "constants";
import { getNextCursorMessage } from "utils/common";
import { checkUserPermission } from "utils/authorize";
import { currentTime } from "utils/logging";
import {
  getRoomName,
  socketsLeaveRoomByUserIds,
  socketsJoinRoomByUserIds,
} from "utils/socket";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "/tmp");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

const router = new Router();

router.get(
  "/:threadId",
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;
    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.status(404).send("Can not find Thread");
    return res.json(await thread.withLastMessage());
  })
);

router.get(
  "/:threadId/user-serving",
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const thread = await db.Thread.findByPk(req.params.threadId);
    if (!thread) return res.status(404).send("Thread not found");
    const [count, usersServing] = await Promise.all([
      thread.countUsersServing(),
      thread.getUsersServing({ limit, offset }),
    ]);
    return res.json({ count, data: usersServing });
  })
);

router.get(
  "/:threadId/user-history",
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const thread = await db.Thread.findByPk(req.params.threadId);
    if (!thread) return res.status(404).send("Thread not found");
    const [count, usersHistory] = await Promise.all([
      thread.countUsersServing(),
      thread.getUsersHistory({ limit, offset }),
    ]);
    return res.json({ count, data: usersHistory });
  })
);

router.get(
  "/:threadId/customers",
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;
    const { name = "", limit, offset } = req.query;
    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.status(404).send("Thread not found");
    const channel = await thread.getChannel();
    if (!channel) return res.status(404).send("Channel of Thread not found");
    const condition = {
      where: {
        $and: {
          ...(name ? { name: { $like: `%${name.toString()}%` } } : {}),
          uniqueKey: { $ne: channel.uniqueKey }, // Filter Channel user
        },
      },
    };
    const [count, customers] = await Promise.all([
      thread.countCustomers(condition),
      thread.getCustomers({
        ...condition,
        scope: "withNotesAndTags",
        limit,
        offset,
      }),
    ]);
    return res.json({ count, data: customers });
  })
);

router.put(
  "/:threadId/status",
  asyncMiddleware(async (req, res) => {
    const { status, cause } = req.body;
    const { threadId } = req.params;
    const { id: userId } = req.user;
    if (
      ![
        THREAD_STATUS_SPAM,
        THREAD_STATUS_DONE,
        THREAD_STATUS_PROCESSING,
        THREAD_STATUS_UNREAD,
      ].includes(status)
    ) {
      return res.status(400).send("Unknown status");
    }

    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.status(404).send("Can not find Thread");

    if (status === THREAD_STATUS_PROCESSING) {
      await Promise.all([
        socketsJoinRoomByUserIds(
          [userId],
          getRoomName(THREAD_SOCKET_KEY, thread.id)
        ),
        thread.addUsersServing(userId),
        thread.addUsersHistory(userId, { through: { updatedAt: new Date() } }),
      ]);
    }
    if (status === THREAD_STATUS_DONE) {
      const usersServing = await thread.getUsersServing();
      socketsLeaveRoomByUserIds(
        usersServing.map((user) => user.id),
        getRoomName(THREAD_SOCKET_KEY, thread.id)
      );
      await thread.setUsersServing([]);
    }

    // Must update thread status last
    await thread.update({ status }, { userId, cause });

    return res.json(await thread.withLastMessage());
  })
);

router.get(
  "/:threadId/messages",
  mountChannel,
  asyncMiddleware(async (req, res) => {
    const { limit, nextCursor } = req.query;
    const { threadId } = req.params;
    const LIMIT_REPLIES = 5;

    const canReadHiddenMessages =
      (req.channel &&
        (await checkUserPermission(
          req.user.id,
          PERMISSION_READ_HIDDEN_MESSAGES,
          req.channel.id
        ))) ||
      false;

    let where = {
      threadId,
      parentId: null,
      ...(!canReadHiddenMessages ? { hidden: false } : undefined),
      msgDeletedAt: null,
    };

    if (typeof nextCursor === "string") {
      // Decode cursor base and update find condition
      const lastMessage = Buffer.from(nextCursor, "base64").toString("utf8");
      const { mid: minId, msgCreatedAt: minMsgCreatedAt } = JSON.parse(
        lastMessage
      );

      where = {
        ...where,
        $or: [
          { msgCreatedAt: { $lt: minMsgCreatedAt } },
          {
            msgCreatedAt: { $eq: minMsgCreatedAt },
            mid: { $lt: minId },
          },
        ],
      };
    }

    const countPromise = db.Message.count({
      where: { threadId, parentId: null },
    });
    const messagesPromise = db.Message.findAll({
      raw: true,
      where,
      order: [
        ["msgCreatedAt", "DESC"],
        ["mid", "DESC"],
      ],
      limit,
    });
    const count = await countPromise;
    const messages = await messagesPromise;

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
          ${!canReadHiddenMessages ? "AND hidden = false" : ""}
          AND msg_deleted_at IS NULL
        GROUP BY parent_id`,
        {
          replacements: { threadId, mids },
          type: db.sequelize.QueryTypes.SELECT,
        }
      ),
      // Thank to Ivan Akimov: https://github.com/sequelize/sequelize/issues/9725
      db.sequelize.transaction(async (transaction) => {
        await db.sequelize.set(
          { message_rank: 0, current_mid: null },
          { transaction }
        );
        return db.sequelize.query(
          `SELECT
              mid,
              thread_id AS threadId,
              customer_id AS customerId,
              is_verified AS isVerified,
              user_id AS userId,
              parent_id AS parentId,
              processed,
              hidden,
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
                  parent_id IN (:mids) AND thread_id = :threadId AND msg_deleted_at IS NULL
              ORDER BY parent_id, msg_created_at DESC, mid DESC) ranked
          WHERE
              message_rank <= :LIMIT_REPLIES`,
          {
            transaction,
            model: db.Message,
            type: db.sequelize.QueryTypes.SELECT,
            replacements: { mids, threadId, LIMIT_REPLIES },
          }
        );
      }),
    ]);

    const replies = await db.Message.joinCustomerAndUser(msgReplies);

    const msgWithReplies = messages.map((msg) => {
      const repliesMsg = replies.filter((reply) => reply.parentId === msg.mid);
      const countRepMsg = countReplies.find(
        (countRep) => countRep.parentId === msg.mid
      );
      const count = countRepMsg ? countRepMsg.count : 0;
      return {
        ...msg,
        replies:
          repliesMsg.length !== 0
            ? {
                count,
                data: repliesMsg,
                nextCursor: getNextCursorMessage(repliesMsg, LIMIT_REPLIES),
              }
            : null,
      };
    });

    return res.json({
      count,
      data: await db.Message.joinCustomerAndUser(msgWithReplies),
      nextCursor: getNextCursorMessage(messages, limit),
    });
  })
);

router.get(
  "/:threadId/messages/:mid",
  asyncMiddleware(async (req, res) => {
    const { mid, threadId } = req.params;
    const { limit, nextCursor } = req.query;
    let where = { parentId: mid, threadId };
    if (typeof nextCursor === "string") {
      // Decode cursor base
      const lastMessage = Buffer.from(nextCursor, "base64").toString("utf8");
      const { mid: minId, msgCreatedAt: minMsgCreatedAt } = JSON.parse(
        lastMessage
      );

      where = {
        ...where,
        $or: [
          { msgCreatedAt: { $lt: minMsgCreatedAt } },
          {
            msgCreatedAt: { $eq: minMsgCreatedAt },
            mid: { $lt: minId },
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
          ["msgCreatedAt", "DESC"],
          ["mid", "DESC"],
        ],
        limit,
      }),
    ]);

    return res.json({
      count,
      data: replies,
      nextCursor: getNextCursorMessage(replies, limit),
    });
  })
);

router.post(
  "/:threadId/messages",
  upload.single("attachment"),
  can(PERMISSION_SEND_MESSAGE),
  asyncMiddleware(async (req, res) => {
    const {
      file: attachment,
      body: { parentId, message },
      params: { threadId },
      user: { id: userId },
    } = req;

    if ((!attachment && !message) || !threadId) return res.sendStatus(400);

    const thread = await db.Thread.findByPk(threadId);

    if (!thread) return res.status(404).send("Thread not found");

    const channel = await db.Channel.findByPk(thread.channelId);
    if (!channel) return res.status(404).send("Channel of Thread not found");
    const { type, uniqueKey } = channel;

    const sendData = {
      attachment,
      userId,
      parentId,
      message,
      target: thread.uniqueKey,
    };
    const channels = await startChannels();
    const channelIM = channels[type][uniqueKey];
    if (!channelIM) return res.status(404).send("Channel IM not found");

    const result = await channelIM.sendMessage(sendData);

    if (!result.success) {
      if (result.response) {
        console.error("[THREAD-API]", currentTime(), result.response);
      }
      const errorMessage = result.response.message || "Có lỗi xảy ra";
      return res.status(400).json({
        success: false,
        response: { message: errorMessage },
      });
    }
    return res.status(200).json(result);
  })
);

router.get(
  "/:threadId/attachments",
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;
    const { type = "image", limit, nextCursor } = req.query;

    let minId = null;
    let minMsgCreatedAt = new Date();

    if (typeof nextCursor === "string") {
      const lastMessage = Buffer.from(nextCursor, "base64").toString("utf8");
      const { mid, msgCreatedAt } = JSON.parse(lastMessage);
      minId = mid;
      minMsgCreatedAt = msgCreatedAt;
    }

    const nextCursorCondition = nextCursor
      ? "AND (msg_created_at < :minMsgCreatedAt OR (msg_created_at = :minMsgCreatedAt AND mid < :minId))"
      : "";
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
        }
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
        }
      ),
    ]);

    const result = messages.map((msg) => {
      const {
        additionData: { attachments },
      } = msg;
      msg.additionData.attachments = attachments.filter(
        (att) => att.type === type
      );
      return msg;
    });

    const count = countData.length === 0 ? 0 : countData[0].count;
    return res.json({
      count,
      data: result,
      nextCursor: getNextCursorMessage(messages, limit),
    });
  })
);

router.get(
  "/:threadId/recover",
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;
    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.sendStatus(404);

    const channel = await db.Channel.findByPk(thread.channelId);
    if (!channel) return res.sendStatus(404);

    const instantChannels = await startChannels();
    const instance = instantChannels[channel.type][channel.uniqueKey];

    if (!instance) return res.sendStatus(404);
    const updateThread = await instance.reloadThread(thread);

    res.json({ dataUpdated: updateThread.additionData.avatarUrl });
  })
);

router.put(
  "/:threadId/clear-miss",
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;

    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.sendStatus(404);

    const channel = await db.Channel.findByPk(thread.channelId);
    if (!channel) return res.sendStatus(404);

    const instantChannels = await startChannels();
    const instance = instantChannels[channel.type][channel.uniqueKey];
    if (!instance) return res.sendStatus(404);

    await instance.clearMissThread(thread);

    res.sendStatus(200);
  })
);

router.post(
  "/:threadId/transfer/:toUserId",
  asyncMiddleware(async (req, res) => {
    const { threadId, toUserId } = req.params;
    const { id: fromUserId } = req.user;
    const thread = await db.Thread.findByPk(threadId);
    if (!thread) return res.status(404).send("Thread not found");
    if (thread.status !== THREAD_STATUS_PROCESSING) {
      return res.status(400).send("Thread is not processing");
    }
    const isUserOwnThread = await thread.hasUsersServing(fromUserId);
    const isUserHasTransferThreadPermission = await checkUserPermission(
      fromUserId,
      PERMISSION_UPDATE_CHANNEL,
      thread.channelId
    );
    if (!isUserOwnThread && !isUserHasTransferThreadPermission) {
      return res
        .status(403)
        .send(
          "You should be the thread owner or admin to transfer this thread."
        );
    }

    const [transferThread, isCreated] = await db.TransferThread.findOrCreate({
      defaults: {
        fromUserId,
        toUserId: parseInt(toUserId),
      },
      where: {
        threadId: parseInt(threadId),
        status: null,
      },
    });
    if (transferThread && !isCreated) {
      return res.status(400).send("Thread is already send to other user");
    }
    const transferThreadWithAdditionInfo = await db.TransferThread.findOne({
      where: { id: transferThread.id },
      include: [db.Thread, { model: db.User, as: "fromUser" }],
    });
    io.of("/")
      .to(getRoomName(USER_SOCKET_KEY, transferThread.toUserId))
      .emit(SOCKET_TRANSFER_THREAD, transferThreadWithAdditionInfo);
    res.sendStatus(200);
  })
);

router.get(
  "/:threadId/status-logs",
  asyncMiddleware(async (req, res) => {
    const { threadId } = req.params;
    const [count, logThreads] = await Promise.all([
      db.LogThread.count({
        where: { threadId },
      }),
      db.LogThread.findAll({
        where: {
          threadId,
          oStatus: THREAD_STATUS_PROCESSING,
          nStatus: THREAD_STATUS_DONE,
        },
        include: [db.User],
        limit: 50,
      }),
    ]);
    res.json({ count, data: logThreads });
  })
);

export default router;
