import { THREAD_STATUS_UNREAD, THREAD_STATUS_PROCESSING, THREAD_STATUS_DONE, THREAD_STATUS_SPAM } from 'constants'

export type ThreadType = {
  id: number,
  uniqueKey: string,
  title: string,
  status: THREAD_STATUS_UNREAD | THREAD_STATUS_PROCESSING | THREAD_STATUS_DONE | THREAD_STATUS_SPAM,
  lastMsgContent?: string,
  missCount: number,
  missTime?: string,
  additionData?: Object,
  createdAt: string,
  updatedAt: string
}
