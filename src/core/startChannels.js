import models from 'models';
import Messenger from 'core/instantMessages/messenger';
import FBComment from 'core/instantMessages/fbcomment';
import { MESSENGER_CHANNEL_TYPE, FBCOMMENT_CHANNEL_TYPE } from 'constants';

let _channels;

const startUpChannels = async (app) => {
  if (_channels !== undefined) return _channels;
  const channels = await models.Channel.findAll({ raw: true });
  _channels = channels.reduce((acc, channel) => {
    const { type, uniqueKey } = channel;
    return {
      ...acc,
      [type]: {
        ...acc[type],
        [uniqueKey]:
          type === MESSENGER_CHANNEL_TYPE
            ? new Messenger(channel, app)
            : type === FBCOMMENT_CHANNEL_TYPE
            ? new FBComment(channel)
            : null,
      },
    };
  }, {});
  return _channels;
};

export default startUpChannels;
