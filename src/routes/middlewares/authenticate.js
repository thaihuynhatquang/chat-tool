import checkAuth from "utils/authenticate";
import { getAccessToken } from "utils/common";

const authenticate = async (req, res, next) => {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) return res.sendStatus(401);
    const user = await checkAuth(accessToken);
    if (!user) return res.sendStatus(401);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(401);
    next(err);
  }
};

export default authenticate;
