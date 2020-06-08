export const nullIfEmptyObj = (obj) => {
  return Object.keys(obj).length === 0 ? null : obj;
};

export const getCookieFromString = (cookieString) => {
  return cookieString.split(";").reduce((acc, item) => {
    const [key, value] = item.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});
};

export const getRoomName = (type, id) => {
  return `${type}:${id}`;
};

export const flatten = (array) => {
  return array.reduce((acc, item) => {
    return acc.concat(item);
  }, []);
};

export const getNextCursorMessage = (messages) => {
  if (!messages || messages.length === 0) return null;
  const lastMessage = messages[messages.length - 1];
  return Buffer.from(
    JSON.stringify({
      msgCreatedAt: lastMessage.msgCreatedAt,
      mid: lastMessage.mid,
    })
  ).toString("base64");
};

export const getFormatedMessageId = (messageId) => {
  if (messageId.indexOf("m_") === 0) {
    return messageId.slice(2);
  }
  return messageId;
};
