export const nullIfEmptyObj = (obj) => {
  return Object.keys(obj).length === 0 ? null : obj;
};

export const getCookieFromString = (cookieString) => {
  return cookieString.split(';').reduce((acc, item) => {
    const [key, value] = item.trim().split('=');
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
