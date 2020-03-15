// @flow
export type AttachmentType = {
  type: 'audio' | 'video' | 'file' | 'image' | 'fallback',
  payload: {
    url: string
  }
}

export type MessageType = {
  mid: string,
  threadId: number,
  customerId: number,
  isVerified: boolean,
  userId?: number,
  parentId?: string,
  content?: string,
  additionData?: {
    attachments?: [AttachmentType]
  },
  msgCreatedAt: string,
  msgUpdatedAt: string,
  msgDeletedAt?: string
}

export type MessengerMessageType = {
  type: 'message' | 'attachment' | 'quick_reply' | 'postback',
  sender: {
    id: string
  },
  recipient: {
    id: string
  },
  timestamp: number,
  message: {
    mid: string,
    seq: number,
    text?: string,
    attachments?: [AttachmentType]
  }
}
