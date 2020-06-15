import db from "models";
import { getUserBot } from "utils/chatbot";

const _calculateMissCountAndTime = async (
  formattedMessage,
  missCount,
  missTime
) => {
  let _missTime = missTime;
  let _missCount = missCount;
  const { isVerified, userId, msgCreatedAt } = formattedMessage;
  const chatBotUser = await getUserBot();
  if (isVerified) {
    if (userId) {
      // user is staff then resolve missCount but bot doesn't
      _missCount = 0;
      _missTime = null;
    }
  } else {
    // customer chat then increasing missCount
    _missCount = missCount ? missCount + 1 : 1;
    _missTime = missTime || msgCreatedAt;
  }
  return {
    missTime: _missTime,
    missCount: _missCount || 0,
  };
};
export const oneLevel = async (formattedMessage, thread) => {
  const { mid } = formattedMessage;
  const { missCount, missTime } = await _calculateMissCountAndTime(
    formattedMessage,
    thread.missCount,
    thread.missTime
  );

  return thread.update({
    missCount,
    missTime,
    lastMsgId: mid,
    lastMsgAt: formattedMessage.msgCreatedAt,
  });
};

export const filterMissTwoLevelInThread = (threadId) => {
  return db.sequelize.query(
    `SELECT
      COUNT(*) as missCount,
      MIN(customer_msg.msg_created_at) as missTime
    FROM
      messages AS customer_msg
    LEFT JOIN
      messages AS admin_msg ON admin_msg.mid = (SELECT
          mid
        FROM
          messages
        WHERE
          messages.is_verified = 1
          AND messages.processed = 0
          AND messages.hidden = 0
          AND messages.msg_deleted_at IS NULL
          AND messages.thread_id = :threadId
          AND messages.msg_created_at >= customer_msg.msg_created_at
          AND messages.parent_id = IF(customer_msg.parent_id IS NULL,
            customer_msg.mid,
            customer_msg.parent_id)
        LIMIT 1)
    WHERE
      customer_msg.is_verified = 0
        AND customer_msg.processed = 0
        AND customer_msg.hidden = 0
        AND customer_msg.msg_deleted_at IS NULL
        AND customer_msg.thread_id = :threadId
        AND admin_msg.mid IS NULL
    ORDER BY customer_msg.msg_created_at ASC
  `,
    {
      replacements: { threadId },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
};

export const twoLevel = async (formattedMessage, thread) => {
  const [{ missCount, missTime }] = await filterMissTwoLevelInThread(thread.id);

  return thread.update({
    lastMsgId: formattedMessage.mid,
    lastMsgAt: formattedMessage.msgCreatedAt,
    missCount,
    missTime,
  });
};
