// @flow
export type ChannelType = {
  id: number,
  uniqueKey: string,
  title: string,
  type: string,
  configs?: Object,
  additionData?: Object,
  createdAt: string,
  updatedAt: string
}

export type MessengerChannelType = ChannelType & {
  type: 'messenger',
  configs: {
    accessToken: string,
    verifyToken: string,
    appSecret: string,
    broadcastEchoes?: boolean
  }
}
