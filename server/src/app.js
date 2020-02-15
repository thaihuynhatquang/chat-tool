// @flow
import 'babel-polyfill'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'

const app = express()

require('dotenv').config()

app.set('env', process.env.NODE_ENV || 'develop')
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../../public')))

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.sendStatus(err.status || 500)
})

app.get('/health', (req, res) => res.send('OK'))

export default app
