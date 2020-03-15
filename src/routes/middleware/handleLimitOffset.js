import { DEFAULT_LIMIT, MAX_LIMIT } from 'constants'

export const handleLimitOffset = (req, res, next) => {
  let { limit, offset } = req.query
  limit = parseInt(limit) || DEFAULT_LIMIT
  req.query.limit = limit > MAX_LIMIT ? MAX_LIMIT : limit
  req.query.offset = parseInt(offset) || 0
  next()
}
