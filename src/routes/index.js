import { Router } from 'express';
import api from 'routes/api';
import webhook from 'routes/webhookFB';
import auth from 'routes/auth';

const router = new Router();

router.get('/health', async (req, res) => {
  res.send('OK');
});

router.use('/webhook', webhook);

router.use('/api', api);

router.use('/auth', auth);

router.get('/play-ground', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en" dir="ltr">
  
  <head>
    <meta charset="utf-8">
    <title>Chat Tool v2</title>
  </head>
  
  <body>
    <h1>Hello world</h1>
  
    <script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io();
      socket.on('connect', function () {
        console.log('connection');
  
         setInterval(() => {
           socket.emit('testing', 2);
        }, 2000)
        socket.emit('testing', 1);
      });
      socket.on('update-thread-status', console.log)
      socket.on('new-message', function (data) { console.log(data) });
      socket.on('ahihi', function (data) { console.log(data) });
      socket.on('error', function (data) { console.log(data)});
      socket.on('disconnect', function () { });
    </script>
  
  </body>
  
  </html>`);
});

export default router;
