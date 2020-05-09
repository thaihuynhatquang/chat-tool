import axios from 'axios';
import db from 'models';
import client from 'config/redis';
import { EXPIRED_TIME } from 'constants';

export default async (accessToken) => {
  let user = JSON.parse(await client.getAsync(`accessToken:${accessToken}`));
  if (!user) {
    const userIAM = await axios.get(`${process.env.IAM_API_URL}/users/me`, {
      headers: { Cookie: `access_token=${accessToken}` },
    });
    const {
      data: { id, createdAt, updatedAt, ...iamUser },
    } = userIAM;
    user = await db.User.findOrCreate({
      raw: true,
      where: { iamId: id },
      defaults: { ...iamUser },
    }).spread((user, created) => user);
    client.set(`accessToken:${accessToken}`, JSON.stringify(user), 'EX', EXPIRED_TIME);
  }
  return user;
};
