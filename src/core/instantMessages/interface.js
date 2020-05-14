import { getRoomName } from 'utils/common';
import db from 'models';
import client from 'config/redis';
import { messagesWithCustomerAndUser } from 'utils/db';
import { socketsJoinRoom, emitNewMessage } from 'utils/socket';
import { CHANNEL_SOCKET_KEY, THREAD_SOCKET_KEY } from 'constants';
const debug = require('debug')('app:im:interface');
class InstantMessage {
  constructor(channel, app) {
    this.channel = channel;
    this.app = app;
  }

  getOrCreateCustomerByMsg = (message) => {
    throw new Error('Empty implementation');
  };

  getOrCreateThreadByMsg = (message) => {
    throw new Error('Empty implementation');
  };

  getFormattedMessage = (message, thread, customer) => {
    throw new Error('Empty implementation');
  };

  onMessage = async (message) => {
    debug('Receive message:\n', JSON.stringify(message, null, 2));
    const customerPromise = this.getOrCreateCustomerByMsg(message);
    const threadPromise = this.getOrCreateThreadByMsg(message);
    const { customer } = await customerPromise;
    const { thread } = await threadPromise;
    const formatedMessage = await this.getFormattedMessage(message, thread, customer);
    const [savedMessage] = await Promise.all([db.Message.create(formatedMessage), thread.addCustomer(customer)]);
    const savedMessageWithCustomerAndUser = await messagesWithCustomerAndUser(savedMessage.toJSON());
    client.delAsync(savedMessage.mid);

    this.triggerOnHandleMessage(savedMessageWithCustomerAndUser, thread);
  };

  triggerOnHandleMessage = (savedMessage, thread) => {};

  emitSocketNewMessage = async (savedMessage, thread, missCountChange) => {
    thread.dataValues.lastMessage = savedMessage;
    const io = this.app.io;

    const roomName = this.channel.configs.isBroadcast
      ? getRoomName(CHANNEL_SOCKET_KEY, this.channel.id)
      : getRoomName(THREAD_SOCKET_KEY, thread.id);

    if (!this.channel.configs.isBroadcast) {
      const usersServing = await thread.getUsersServing();
      await socketsJoinRoom(io, usersServing, roomName);
    }

    emitNewMessage(io, roomName, {
      thread: thread.toJSON(),
      message: savedMessage,
      channel: { id: thread.channelId, missCountChange },
    });
  };

  onEvent = async (event) => {
    debug('Receive event:\n', JSON.stringify(event, null, 2));
  };

  sendMessage = async (message) => {
    return false;
  };
}

export default InstantMessage;
