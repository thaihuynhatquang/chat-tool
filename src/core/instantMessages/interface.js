import db from 'models';
import client from 'config/redis';

const debug = require('debug')('app:im:interface');
class InstantMessage {
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

    client.delAsync(savedMessage.mid);

    this.triggerOnHandleMessage(formatedMessage, thread);
  };

  triggerOnHandleMessage = (formatedMessage, thread, customer) => {};

  onEvent = async (event) => {
    debug('Receive event:\n', JSON.stringify(event, null, 2));
  };

  sendMessage = async (message) => {
    return false;
  };
}

export default InstantMessage;
