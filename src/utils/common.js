/**
 * Return null if input object is empty.
 * Otherwise, return the object itself.
 *
 * @param {Object} obj
 * @return {Object | null}
 */
export const nullIfEmptyObj = (obj) => {
  return Object.keys(obj).length === 0 ? null : obj;
};

/**
 * Get cookie object from cookie string
 * @param {String} cookieString
 * @return {Object} cookieObject
 */
export const getCookieFromString = (cookieString) => {
  return cookieString.split(';').reduce((acc, item) => {
    const [key, value] = item.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
};

/**
 * Get Room name
 * @param {String} type
 * @param {String} id
 * @return {String} roomName
 */
export const getRoomName = (type, id) => {
  return `${type}:${id}`;
};

/**
 * Get 1D array from 2D array
 * @param {Array<Array>} array
 * @return {Array}
 */
export const flatten = (array) => {
  return array.reduce((acc, item) => {
    return acc.concat(item);
  }, []);
};

/**
 * get nextCursor of messages array
 * @param {Array} messages
 */
export const getNextCursorMessage = (messages) => {
  if (!messages || messages.length === 0) return null;
  const lastMessage = messages[messages.length - 1];
  return Buffer.from(
    JSON.stringify({
      msgCreatedAt: lastMessage.msgCreatedAt,
      mid: lastMessage.mid,
    }),
  ).toString('base64');
};
