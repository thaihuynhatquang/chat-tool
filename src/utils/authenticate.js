import axios from "axios";
import client from "config/redis";
import db from "models";
import { EXPIRED_TIME } from "constants";
const debug = require("debug")("app:middlewares:authenticate");

export default async (accessToken) => {
  try {
    const redisCacheKey = `iamUser:${accessToken}`;
    const cachingIAMRequest = await client.getAsync(redisCacheKey);

    const userIAM = cachingIAMRequest
      ? JSON.parse(cachingIAMRequest)
      : await axios
          .get(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`
          )
          .then((res) => res.data);
    const {
      sub: googleId,
      picture,
      createdAt,
      updatedAt,
      ...iamUser
    } = userIAM;
    let user = await db.User.findOne({
      where: { googleId },
    });
    if (!user) {
      const avatarUrl = picture || "/images/default.png";
      user = await db.User.create({
        googleId,
        ...iamUser,
        avatarUrl,
      });
    } else {
      const avatarUrl = user.avatarUrl || picture;
      await user.update({
        googleId,
        ...iamUser,
        avatarUrl,
      });
    }

    client.set(redisCacheKey, JSON.stringify(userIAM), "EX", EXPIRED_TIME);

    return user;
  } catch (err) {
    debug("Something went wrong with check authenticate", err);
    return null;
  }
};
