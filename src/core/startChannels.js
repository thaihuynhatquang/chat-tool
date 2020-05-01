import models from 'models';
import Messenger from 'core/instantMessages/messenger';
import FBComment from 'core/instantMessages/fbcomment';

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
          type === 'messenger' ? new Messenger(channel, app) : type === 'fbcomment' ? new FBComment(channel) : null,
      },
    };
  }, {});
  return _channels;
};

export default startUpChannels;
