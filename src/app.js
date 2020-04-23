import 'babel-polyfill'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import startChannels from 'core/startChannels'
import routers from 'routes'
import debugLib from 'debug'

const debug = debugLib('app')
const app = express()

app.set('env', process.env.NODE_ENV || 'develop')
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../../public')))

app.use(routers)

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // TODO: logging error to file
  debug('Something went wrong: ', err)
  res.sendStatus(err.status || 500)
})

startChannels(app)

export default app
