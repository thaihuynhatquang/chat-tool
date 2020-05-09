import db from 'models';

export const oneLevel = async (formattedMessage, thread) => {
  const { isVerified, mid, msgCreatedAt } = formattedMessage;
  let { missTime, missCount } = thread;
  missCount = isVerified ? 0 : missCount ? missCount + 1 : 1;
  missTime = isVerified ? null : missTime || msgCreatedAt;
  return thread.update({ missCount, missTime, lastMsgId: mid });
};

export const twoLevel = async (formattedMessage, thread) => {
  const { mid, isVerified, parentId, msgCreatedAt } = formattedMessage;

  if (!parentId) {
    await db.ThreadInferenceData.create({
      uniqueKey: mid,
      threadId: thread.id,
      missCount: isVerified ? 0 : 1,
      missTime: isVerified ? null : msgCreatedAt,
      lastMsgId: mid,
    });
  }

  const inferenceData = await db.ThreadInferenceData.findOne({
    where: {
      uniqueKey: parentId || mid,
      threadId: thread.id,
    },
  });

  if (inferenceData) {
    await inferenceData.update({
      missCount: isVerified ? 0 : parentId ? inferenceData.missCount + 1 : 1,
      missTime: isVerified ? null : inferenceData.missTime || msgCreatedAt,
      lastMsgId: mid,
    });
  }

  const [{ missTime, missCount }] = await db.ThreadInferenceData.findAll({
    attributes: [
      [db.sequelize.fn('SUM', db.sequelize.col('miss_count')), 'missCount'],
      [db.sequelize.fn('MIN', db.sequelize.col('miss_time')), 'missTime'],
    ],
    where: {
      threadId: thread.id,
    },
  });

  return thread.update({ missCount, missTime, lastMsgId: mid });
};
