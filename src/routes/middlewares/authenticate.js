import checkAuth from "utils/authenticate";

const authenticate = async (req, res, next) => {
  try {
    const tokenPattern = "Bearer ";
    const accessToken =
      req.cookies.access_token ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith(tokenPattern) &&
        req.headers.authorization.substring(tokenPattern.length));
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
