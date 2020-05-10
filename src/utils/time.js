import moment from 'moment';

export const formatTime = (time) => new Date(moment(time).format('YYYY-MM-DD HH:mm:ss'));
