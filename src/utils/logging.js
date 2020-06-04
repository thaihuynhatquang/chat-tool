import moment from "moment";

export const logError = (err, isUnsafe = true) => {
  const time = moment().format();
  if (isUnsafe) {
    console.error(`[${time}] Something went wrong:`, err);
  } else {
    console.warn(`[${time}] Error but safe catch, log as warning:`, err);
  }
};

export const currentTime = () =>
  moment()
    .add(7, "hours")
    .format("YYYY/MM/DD HH:mm:ss");
