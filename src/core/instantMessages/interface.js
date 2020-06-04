import db from "models";
import client from "config/redis";
import { NODE_APP_INSTANCE } from "constants";

const debug = require("debug")("app:im:interface");

class InstantMessage {
  channel;
  accessToken;

  constructor(channel) {
    this.channel = channel;
  }

  updateAccessToken(token) {
    this.accessToken = token;
  }

  getOrCreateCustomerByMsg = async (message) => {
    throw new Error("Empty implementation");
  };

  getOrCreateThreadByMsg = async (message) => {
    throw new Error("Empty implementation");
  };

  getFormattedMessage = async (message, thread, customer) => {
    throw new Error("Empty implementation");
  };

  onMessage = async (message) => {
    debug(
      "Receive message:\n",
      JSON.stringify(message, null, 2),
      "in cluster instance",
      NODE_APP_INSTANCE
    );
    const customerPromise = this.getOrCreateCustomerByMsg(message);
    const threadPromise = this.getOrCreateThreadByMsg(message);
    const { customer } = await customerPromise;
    const { thread } = await threadPromise;
    // $FlowFixMe
    const formatedMessage = await this.getFormattedMessage(
      message,
      thread,
      customer
    );
    const [[savedMessage]] = await Promise.all([
      db.Message.findOrCreate({
        where: {
          mid: formatedMessage.mid,
          threadId: formatedMessage.threadId,
        },
        defaults: formatedMessage,
      }),
      thread.addCustomer(customer),
    ]);
    const savedMessageWithCustomerAndUser = await savedMessage.withCustomerAndUser();
    client.delAsync(savedMessage.mid);

    this.triggerOnHandleMessage(savedMessageWithCustomerAndUser, thread);
  };

  triggerOnHandleMessage = async (savedMessage, thread) => {};

  onEvent = async (event) => {
    debug("Receive event:\n", JSON.stringify(event, null, 2));
  };

  sendMessage = async (message) => {
    return { success: false };
  };
}

export default InstantMessage;
