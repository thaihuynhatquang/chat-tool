/**
 * InstantMessage interface. Other IMs should extend this class.
 */
class InstantMessage {
  /**
   * Initialize IM.
   * @param {object} options Different with each IMs.
   */
  constructor (options) {
    throw new Error('Empty implementation')
  }

  /**
   * Send a message. Information includes: receiver, content... is defined within the message.
   * @param  {Object} message
   * @return {Promise} Resolve value indicates if the message is successfully sent or not.
   */
  sendMessage = async message => {
    return false
  }

  /**
   * Get {limit} messages of thread, from a specific message {offsetMessage}.
   * @param  {Object} offsetMessage
   * @param  {Number} limit
   * @return {Array} Array of next {limit} messages after {offsetMessage} message.
   */
  getMessages = (offsetMessage, limit) => {
    return []
  }

  /**
   * Convert messages from each IMs into one exclusively standard form.
   * @param  {Object} message Different with each IMs.
   * @return {Object} Standardized message which can be understood by all IM instances and redundant-free.
   */
  standardizedMessage = message => {
    throw new Error('Empty implementation')
  }

  /**
   * Pre-handle message. Can be empty.
   * @param  {Object}  message The message will be handled.
   * @return {Promise}
   */
  preHandleMessage = async message => { }

  /**
   * Post-handle message. Can be empty.
   * @param  {Object}  message The message handled.
   * @return {Promise}
   */
  postHandleMessage = async message => { }

  /**
   * Listen whenever new message is received.
   * @param  {Object} message Different with each IMs.
   * @return {Void}
   */
  __onMessage = async message => {
    const standardizedMessage = this.standardizedMessage(message)
    await this.preHandleMessage(standardizedMessage)
    await this.__handleMessage(standardizedMessage)
    await this.postHandleMessage(standardizedMessage)
  }

  /**
   * Main handle message process. Should not be modified. Same logic for all IMs.
   * @param  {Object}  message  The message will be handled.
   * @return {Promise}
   */
  __handleMessage = async message => {

  }
}

export default InstantMessage
