import { Router } from 'express'
import axios from 'axios'
import * as queryString from 'query-string'

const router = new Router()

router.get('/', async (req, res) => {
  const { code } = req.query
  if (!code) {
    const stringifiedParams = queryString.stringify({
      client_id: '745337904100-39b3q1livdk0iono5c2c34o3ijket2od.apps.googleusercontent.com',
      redirect_uri: 'http://localhost:3000/auth',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '), // space seperated string
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })

    const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
    res.redirect(googleLoginUrl)
  } else {
    let data
    axios({
      url: `https://oauth2.googleapis.com/token`,
      method: 'post',
      data: {
        client_id: '745337904100-39b3q1livdk0iono5c2c34o3ijket2od.apps.googleusercontent.com',
        client_secret: 'bfDeGx6XgpT-ZuYn7Nig0t_-',
        redirect_uri: 'http://localhost:3000/auth',
        grant_type: 'authorization_code',
        code
      }
    })
      .then((response) => {
        const access_token = response.data.access_token
        return axios({
          url: 'https://www.googleapis.com/oauth2/v2/userinfo',
          method: 'get',
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        })
      })
      .then((response) => {
        data = response.data
        res.send({ data })
      })
      .catch((e) => {
        console.log(e)
      })
  }
})

export default router
