import moment from 'moment';

export const formatTime = (time) => moment(time).format('YYYY-MM-DD HH:mm:ss');
