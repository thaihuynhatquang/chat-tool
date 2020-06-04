import moment from "moment";

export const formatTime = (time) =>
  new Date(moment(time).format("YYYY-MM-DD HH:mm:ss"));

export const isWorkingTime = (channel, time = moment().format()) => {
  const {
    configs: { workTime },
  } = channel;

  if (!workTime) return false;

  const zone = process.env.TIMEZONE || "+07:00";
  const currentTime = moment(time).utcOffset(zone);
  const dayOfWeek = moment(currentTime).day();
  const hourMinTime = currentTime.format("HH:mm");
  const getHourMin = (time) => {
    return moment(time, "HH:mm");
  };

  return workTime.some((period) => {
    if (!period.week[dayOfWeek - 1]) return false;
    if (
      getHourMin(hourMinTime).isAfter(getHourMin(period.start)) &&
      getHourMin(hourMinTime).isBefore(getHourMin(period.end))
    ) {
      return true;
    }
  });
};
