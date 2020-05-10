import db from 'models';

export const messagesWithCustomerAndUser = async (inp) => {
  if (!inp) return null;
  const isArrayInp = Array.isArray(inp);
  const messages = isArrayInp ? inp : [inp];
  const customerIds = messages.filter((message) => message.customerId).map((message) => message.customerId);
  const userIds = messages.filter((message) => message.userId).map((message) => message.userId);
  const [customers, users] = await Promise.all([
    db.Customer.findAll({ raw: true, where: { id: customerIds } }),
    db.User.findAll({ raw: true, where: { id: userIds } }),
  ]);
  const result = messages.map((message) => ({
    ...message,
    ...(message.customerId && {
      customer: customers.find((item) => item.id === message.customerId),
    }),
    ...(message.userId && {
      user: users.find((item) => item.id === message.userId),
    }),
  }));
  return isArrayInp ? result : result[0];
};

export const threadsWithLastMessage = async (inp) => {
  if (!inp) return null;
  const isArrayInp = Array.isArray(inp);
  const threads = isArrayInp ? inp : [inp];

  const lastMsgIds = threads.filter((thread) => thread.lastMsgId).map((thread) => thread.lastMsgId);
  const lastMsgs = await db.Message.findAll({
    raw: true,
    where: { mid: lastMsgIds },
  });
  const lastMsgsWithCustomerAndUser = await messagesWithCustomerAndUser(lastMsgs);
  const result = threads.map((thread) => ({
    ...thread.toJSON(),
    ...(thread.lastMsgId && {
      lastMessage: lastMsgsWithCustomerAndUser.find((item) => item.mid === thread.lastMsgId),
    }),
  }));
  return isArrayInp ? result : result[0];
};
