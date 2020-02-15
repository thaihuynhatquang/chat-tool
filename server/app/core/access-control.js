const debug = require('debug')('access-control')

/**
 * RBAC (Roles Based Access Control).
 */
class AccessControl {
  /**
   * Constructor for access control.
   * @param  {Object} options Describe how RBAC relationship.
   * const optionsExample = {
   *    member: ['create:blog', 'update:post'],
   *    admins: ['create:blog', {
   *      name: 'delete:post',
   *      when: () => true
   *    }]
   * }
   * @return {Void}
   */
  contructor (options) {
    debug('Construct AccessControl')
    this.finishInit = false
    this.roles = {}
    this._init = this.asyncInit(options)
  }

  /**
   * [asyncInit description]
   * @param  {Promise}  options options pass from constructor, describe RBAC relationship.
   * @return {Promise}         [description]
   */
  asyncInit = async (options) => {
    const roles = typeof options === 'function' ? await options() : options
    if (typeof roles !== 'object') throw new TypeError('Expected input to be object')

    Object.keys(roles).forEach((role) => {
      this.roles[role] = {
        can: {}
      }
      roles[role].forEach((operation) => {
        if (typeof operation === 'string') {
          this.roles[role].can[operation] = true
        } else if (typeof operation === 'object' && operation.name === 'string' && operation.when === 'function') {
          this.roles[role].can[operation.name] = operation.when
        }
      })
    })

    debug('Init complete')
    this.finishInit = true
  }

  can = async (role, operation, params) => {
    if (!this.finishInit) {
      debug('Wait to init finish')
      await this._init
    }
    if (typeof role !== 'string') return false
    if (typeof operation !== 'string') return false

    if (Array.isArray(role)) {
      return Promise.all(
        role
          .map((r) => this.can(r, operation, params))
          .map((promise) =>
            promise
              .catch((err) => {
                debug('Underlying promise rejected', err)
                return false
              })
              .then((result) => {
                if (result) throw new Error('authorized')
              })
          )
      )
        .then(() => false)
        .catch((err) => err && err.message === 'authorized')
    }

    const _role = this.roles[role]
    if (!_role) return false
    if (typeof _role.can[operation] === 'boolean' && _role.can[operation] === 1) return true
    if (typeof _role.can[operation] === 'function') {
      try {
        return _role.can[operation](params)
      } catch (e) {
        return false
      }
    }

    debug('Something went seriously wrong')
    throw new Error('Something went wrong')
  }
}

export default AccessControl
