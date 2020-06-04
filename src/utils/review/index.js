import db from "models";
import client from "config/redis";
import { TOOL_REVIEW_KEY } from "constants";
import questions from "./questions";
import startChannels from "core/startChannels";

const getReviewTypeOfThread = async (thread) => {
  const reviewTool = await db.Tool.findByPk(TOOL_REVIEW_KEY);
  if (!reviewTool) return null;
  const reviewType = reviewTool.configs.usage[thread.channelId];
  return reviewType;
};

export const handleConversationResponse = async (bootbot, message, thread) => {
  const reviewType = await getReviewTypeOfThread(thread);
  if (!reviewType) return;

  const logReview = await db.LogReview.findOne({
    where: {
      type: reviewType,
      isEnd: 0,
      threadId: thread.id,
    },
    include: [db.User],
  });
  if (!logReview) return;

  const { content, additionData } = message;
  const quickReply = additionData && additionData.quickReply;

  const questionKey = logReview.currentQuestion;

  await logReview.update({
    answers: [...logReview.answers, { content, questionKey }],
  });

  const question = questions[reviewType](thread, logReview.user)[questionKey];
  const chosenQuickReply =
    question.quickReplies &&
    question.quickReplies.find(
      (reply) =>
        (content && reply.title.toLowerCase() === content.toLowerCase()) ||
        (quickReply && reply.payload === quickReply.payload)
    );
  const nextQuestionKey =
    (chosenQuickReply && chosenQuickReply.next) || question.next;
  askReviewConversation(
    bootbot,
    reviewType,
    nextQuestionKey,
    thread,
    logReview.user
  );
};

const askReviewConversation = async (
  bootbot,
  reviewType,
  questionKey,
  thread,
  user
) => {
  const question = questions[reviewType](thread, user)[questionKey];
  const filterFieldQuestion =
    question &&
    (question.quickReplies
      ? {
          text: question.text,
          quickReplies: question.quickReplies.map((item) => {
            const { next, ...rest } = item;
            return rest;
          }),
        }
      : question.text);

  // Handle case if there isn't next question as well.
  question && bootbot.say(thread.uniqueKey, filterFieldQuestion);
  if (questionKey && question) {
    await db.LogReview.update(
      { currentQuestion: questionKey },
      { where: { isEnd: 0, threadId: thread.id } }
    );
  }
  if (!question || question.isEnd) {
    await db.LogReview.update(
      { isEnd: 1 },
      { where: { isEnd: 0, threadId: thread.id } }
    );
    const reviewTool = await db.Tool.findByPk(TOOL_REVIEW_KEY);
    // $FlowFixMe
    const customers = await thread.getCustomers();
    const channel = await thread.getChannel();
    if (!channel || !customers || customers.length !== 2) return false;

    const customer = customers.find(
      (customer) => customer.uniqueKey !== channel.uniqueKey
    );

    if (reviewTool && customer) {
      client.set(
        `reviewToolExpire:${reviewType}:${customer.id}`,
        new Date().getTime().toString(),
        "EX",
        reviewTool.configs.reviewExpire
      );
    }
  }
};

export const sendReview = async (thread, user) => {
  const channelIMs = await startChannels();
  const channel = await thread.getChannel();
  if (!channel) throw new Error("Cannot find channel of thread");

  const channelIM =
    channelIMs[channel.type] && channelIMs[channel.type][channel.uniqueKey];
  if (!channelIM) throw new Error("Cannot find channel IM");

  const bootbot = channelIM.bot;
  if (!bootbot) {
    throw new Error(
      "Cannot find bootbot of channel. Review currently only support for IMs have bootbot"
    );
  }

  const reviewType = await getReviewTypeOfThread(thread);

  if (!reviewType || !questions[reviewType]) {
    throw new Error("Cannot find review questions set");
  }

  await db.LogReview.create({
    type: reviewType,
    threadId: thread.id,
    userId: user.id,
    currentQuestion: "start",
  });
  askReviewConversation(bootbot, reviewType, "start", thread, user);
};

export const shouldSendReview = async (thread, user) => {
  const reviewTool = await db.Tool.findByPk(TOOL_REVIEW_KEY);
  if (!reviewTool) return false;
  if (!reviewTool.configs.usage[thread.channelId]) return false;
  const reviewType = reviewTool.configs.usage[thread.channelId];

  // $FlowFixMe
  const customers = await thread.getCustomers();
  const channel = await thread.getChannel();
  if (!channel || !customers || customers.length !== 2) return false;

  const customer = customers.find(
    (customer) => customer.uniqueKey !== channel.uniqueKey
  );
  const isNotExpired = await client.getAsync(
    `reviewToolExpire:${reviewType}:${customer.id}`
  );
  if (isNotExpired) return false;

  return true;
};

export const checkAndSendReview = async (...args) => {
  if (await shouldSendReview(...args)) await sendReview(...args);
};
