import axios from 'axios';
import db from 'models';
import client from 'config/redis';
import { EXPIRED_TIME } from 'constants';

const authorize = async (req, res, next) => {
  const accessToken =
    req.cookies.access_token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ') &&
      req.headers.authorization.substring(7));
  if (!accessToken) return res.sendStatus(401);
  let user = JSON.parse(await client.getAsync(`accessToken:${accessToken}`));
  if (!user) {
    const {
      data: { id, createdAt, updatedAt, ...iamUser },
    } = await axios
      .get(`${process.env.IAM_API_URL}/users/me`, {
        headers: { Cookie: `access_token=${accessToken}` },
      })
      .catch((err) => res.sendStatus(401).json(err));
    user = await db.User.findOrCreate({
      raw: true,
      where: { iamId: id },
      defaults: { ...iamUser },
    }).spread((user, created) => user);
    client.set(`accessToken:${accessToken}`, JSON.stringify(user), 'EX', EXPIRED_TIME);
  }
  req.user = user;
  next();
};

export default authorize;
