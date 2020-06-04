import axios from 'axios'
import client from 'config/redis'
import db from 'models'
import { EXPIRED_TIME } from 'constants'
const debug = require('debug')('app:middlewares:authenticate')

export default async (accessToken) => {
  try {
    const redisCacheKey = `iamUser:${accessToken}`
    const cachingIAMRequest = await client.getAsync(redisCacheKey)

    const userIAM = cachingIAMRequest
      ? JSON.parse(cachingIAMRequest)
      : await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`)
        .then(res => res.data)
    const { sub: iamId, picture: avatarUrl, createdAt, updatedAt, ...iamUser } = userIAM

    let user = await db.User.findOne({
      where: { iamId }
    })
    if (!user) {
      const avatarUrl = iamUser.avatarUrl || '/images/default.png'
      user = await db.User.create({
        iamId,
        ...iamUser,
        avatarUrl
      })
    } else {
      const avatarUrl = user.avatarUrl || iamUser.avatarUrl
      await user.update({
        iamId,
        ...iamUser,
        avatarUrl
      })
    }

    client.set(redisCacheKey, JSON.stringify(userIAM), 'EX', EXPIRED_TIME)

    return user
  } catch (err) {
    debug('Something went wrong with check authenticate', err)
    return null
  }
}
