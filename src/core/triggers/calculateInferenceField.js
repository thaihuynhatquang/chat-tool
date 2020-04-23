import client from 'config/redis';
import { nullIfEmptyObj } from 'utils/common';

const saveInferenceField = async (formattedMessage, redisKey) => {
  const redisInfo = JSON.parse(await client.getAsync(redisKey));
  const missCount = formattedMessage.isVerified
    ? 0
    : redisInfo && redisInfo.missCount
    ? parseInt(redisInfo.missCount) + 1
    : 1;
  const missTime = formattedMessage.isVerified
    ? null
    : redisInfo && redisInfo.missTime
    ? redisInfo.missTime
    : formattedMessage.msgCreatedAt;
  return client.set(
    redisKey,
    JSON.stringify({
      missCount,
      missTime,
      lastMessage: formattedMessage,
    }),
  );
};

export const oneLevel = async (formattedMessage, thread) => {
  return saveInferenceField(formattedMessage, `threadInfo:${thread.id}`);
};

export const twoLevel = async (formattedMessage, thread) => {
  if (!formattedMessage.parentId) {
    await client.set(
      `threadInfo:${thread.id}:${formattedMessage.mid}`,
      JSON.stringify({
        missCount: formattedMessage.isVerified ? 0 : 1,
        missTime: formattedMessage.isVerified ? null : formattedMessage.msgCreatedAt,
        lastMessage: formattedMessage,
      }),
    );
  } else {
    await saveInferenceField(formattedMessage, `threadInfo:${thread.id}:${formattedMessage.parentId}`);
  }

  let messageKeys = [];

  let cursor = 0;
  while (true) {
    const [nextCursor, keys] = await client.scanAsync(cursor, 'MATCH', `threadInfo:${thread.id}:*`, 'COUNT', 1000);
    messageKeys.push(...keys);
    if (nextCursor === '0') break;
    cursor = nextCursor;
  }
  const listMessageInfo = (await Promise.all(messageKeys.map((key) => client.getAsync(key)))).map((el) =>
    JSON.parse(el),
  );

  const missCount = listMessageInfo.reduce((acc, msg) => msg.missCount + acc, 0);

  const missTime = nullIfEmptyObj(
    listMessageInfo.reduce((acc, msg) => {
      if (!msg.missTime) return acc;
      if (msg.missTime < acc) return msg.missTime;
      else return acc;
    }, {}),
  );

  return client.set(
    `threadInfo:${thread.id}`,
    JSON.stringify({
      missTime,
      missCount,
      lastMessage: formattedMessage,
    }),
  );
};
