import db from "models";
import Messenger from "core/instantMessages/messenger";
import FBComment from "core/instantMessages/fbcomment";
import { MESSENGER_CHANNEL_TYPE, FBCOMMENT_CHANNEL_TYPE } from "constants";

let _channels;

const startUpChannels = async () => {
  if (_channels !== undefined) return _channels;
  const channels = await db.Channel.findAll();
  _channels = channels.reduce((acc, channel) => {
    const { type, uniqueKey } = channel;
    return {
      ...acc,
      [type]: {
        ...acc[type],
        [uniqueKey]:
          type === MESSENGER_CHANNEL_TYPE
            ? new Messenger(channel)
            : type === FBCOMMENT_CHANNEL_TYPE
            ? new FBComment(channel)
            : null,
      },
    };
  }, {});
  return _channels;
};

export default startUpChannels;
