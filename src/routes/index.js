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

// router.use('/auth', auth);

export default router;
