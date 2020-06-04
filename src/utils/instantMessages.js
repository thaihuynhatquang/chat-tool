import db from "models";
import moment from "moment";
import { MAX_ASSIGN_THREADS_PER_USER } from "constants";
import { currentTime } from "utils/logging";
const { sequelize } = db;

export const getBestUserForThread = async (userIds, thread) => {
  if (userIds.length === 0) return null;
  const countThreadsUserServing = await sequelize.query(
    `SELECT
      thread_user_serving.user_id AS servingUserId,
      COUNT(*) AS processingThreadsCount
    FROM
      thread_user_serving
        INNER JOIN
      threads ON threads.id = thread_user_serving.thread_id AND threads.status = 'processing'
    WHERE
      threads.channel_id = :channelId
        AND thread_user_serving.user_id IN (:userIds)
    GROUP BY thread_user_serving.user_id;`,
    {
      replacements: { userIds, channelId: thread.channelId },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  const usersHistory = await thread.getUsersHistory();

  const usersWithRankingInfo = userIds.map((userId) => {
    const lastServe = usersHistory.find((_user) => _user.id === userId);
    const countThreads = countThreadsUserServing.find(
      (item) => item.servingUserId === userId
    );
    return {
      userId,
      lastServeAt: lastServe ? lastServe.ThreadUsersHistory.updatedAt : null,
      servingThreadsCount:
        (countThreads && countThreads.processingThreadsCount) || 0,
    };
  });

  const filterAvailableUsers = usersWithRankingInfo.filter(
    (user) =>
      user.lastServeAt || user.servingThreadsCount < MAX_ASSIGN_THREADS_PER_USER
  );

  // Ranked userIds. Lower index means better place.
  // Compare(a, b) return negative means sort a to an index lower than b.
  const userIdsRanked = filterAvailableUsers.sort((a, b) => {
    if (a.lastServeAt && !b.lastServeAt) return -1;
    if (!a.lastServeAt && b.lastServeAt) return 1;

    if (a.lastServeAt && b.lastServeAt) {
      if (moment(a.lastServeAt).isAfter(moment(b.lastServeAt))) return -1;
      if (moment(a.lastServeAt).isBefore(moment(b.lastServeAt))) return 1;
    }

    if (a.servingThreadsCount >= MAX_ASSIGN_THREADS_PER_USER) return 1;
    if (b.servingThreadsCount >= MAX_ASSIGN_THREADS_PER_USER) return -1;

    if (a.servingThreadsCount < b.servingThreadsCount) return -1;
    if (a.servingThreadsCount > b.servingThreadsCount) return 1;

    return 0;
  });
  if (userIdsRanked.length > 0) {
    console.info(
      `[LOG RANKING][${currentTime()}] Ranking ${userIds.toString()} on thread ${
        thread.id
      }.\n`,
      `Users ranked:`,
      userIdsRanked
    );
  }

  return userIdsRanked.length > 0 ? userIdsRanked[0].userId : null;
};
