import checkAuth from 'utils/authorize';

const authorize = async (req, res, next) => {
  try {
    const tokenPattern = 'Bearer ';
    const accessToken =
      req.cookies.access_token ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith(tokenPattern) &&
        req.headers.authorization.substring(tokenPattern.length));
    if (!accessToken) return res.sendStatus(401);
    const user = await checkAuth(accessToken);
    req.user = user;
    next();
  } catch (err) {
    // TODO: Logging error here
    return res.sendStatus(401);
  }
};

export default authorize;
