import db from 'models'

export const loggingRequest = async (req, res, next) => {
  try {
    const startTime = Date.now()
    const path = req.baseUrl ? req.baseUrl + req.path : req.path
    const method = req.method
    const body = {
      ...req.body,
      user: req.user
    }
    const request = {
      path,
      method,
      params: req.query,
      body
    }
    const logRequestPromise = db.LogRequest.create(request)
    res.on('finish', async () => {
      const elapsedTime = Date.now() - startTime
      const responseStatus = res.statusCode
      const logRequest = await logRequestPromise
      logRequest.update({ elapsedTime, responseStatus })
    })
    next()
  } catch (err) {
    next(err)
  }
}
