// @flow
import models from 'models'

const debug = require('debug')('app:im:interface')
/**
 * InstantMessage interface. Other IMs should extend this class.
 */
class InstantMessage {
  /**
   * Find customer in db, if not exist, create new customer
   * @abstract
   * @param {Object} message Different with each IMs.
   * @return {Object} customer
   */
  getOrCreateCustomerByMsg = (message) => {
    throw new Error('Empty implementation')
  }

  /**
   * Find thread in db, if not exist, create new thread
   * @abstract
   * @param {Object} message Different with each IMs.
   * @return {Object} thread
   */
  getOrCreateThreadByMsg = (message) => {
    throw new Error('Empty implementation')
  }

  /**
   * Format message to standard format
   * @param {Object} message Different with each IMs.
   * @return {Object} JSON format like:
   * { mid: string,
   *   threadId: int,
   *   cusomerId: int,
   *   userId?: int,
   *   parentId?: string,
   *   content: text,
   *   additionData?: json,
   *   msgCreatedAt: timestamp,
   *   msgUpdatedAt: timestamp,
   *   msgDeletedAt?: timestamp
   * }
   */
  getFormattedMessage = (message, thread, customer) => {
    throw new Error('Empty implementation')
  }

  /**
   * Listen whenever new message is received.
   * This function should be same among all IM instances.
   * @param  {Object} message Different with each IMs.
   */
  onMessage = async (message) => {
    debug('Receive message:\n', JSON.stringify(message, null, 2))
    const customerPromise = this.getOrCreateCustomerByMsg(message)
    const threadPromise = this.getOrCreateThreadByMsg(message)
    const customer = await customerPromise
    const thread = await threadPromise
    const formatedMessage = this.getFormattedMessage(message, thread, customer)
    await models.Message.create(formatedMessage)
  }

  /**
   * Function send message
   * @abstract
   * @param  {Object} message Different with each IMs.
   * @return {Promise} Resolve value indicates if the message is successfully sent or not.
   */
  sendMessage = async (message) => {
    return false
  }
}

export default InstantMessage
