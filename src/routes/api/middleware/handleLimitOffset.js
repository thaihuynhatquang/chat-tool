import { DEFAULT_LIMIT, MAX_LIMIT } from 'constants';

export default (req, res, next) => {
  const { limit = DEFAULT_LIMIT, offset = 0 } = req.query;
  req.query.limit = Math.min(parseInt(limit), MAX_LIMIT);
  req.query.offset = parseInt(offset);
  next();
};
