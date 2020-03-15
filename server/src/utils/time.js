// @flow
import moment from 'moment'

export const formatTime = (time: any): string => moment(time).format('YYYY-MM-DD HH:mm:ss')
