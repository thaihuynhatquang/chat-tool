import axios from 'axios';
import db from 'models';
import client from 'config/redis';
import { EXPIRED_TIME } from 'constants';

export default async (accessToken) => {
  let user = JSON.parse(await client.getAsync(`accessToken:${accessToken}`));
  if (!user) {
    const { data } = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`);
    console.log(data);
    user = await db.User.findOrCreate({
      raw: true,
      where: { googleId: data.sub },
      defaults: {
        googleId: data.sub,
        name: data.name,
        email: data.email,
        avatarUrl: data.picture,
      },
    }).spread((user, created) => user);
    client.set(`accessToken:${accessToken}`, JSON.stringify(user), 'EX', EXPIRED_TIME);
  }
  return user;
};
