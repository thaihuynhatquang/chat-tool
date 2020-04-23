import { Router } from 'express';
import db from 'models';

const router = new Router();

router.get('/', async (req, res) => {
  const users = await db.User.findAndCountAll();
  return res.json({ count: users.count, data: users.rows });
});

router.get('/me', async (req, res) => {
  const user = await db.User.findByPk(req.user.id);
  return res.json(user);
});

router.get('/:userId', async (req, res) => {
  const user = await db.User.findByPk(req.params.userId);
  return res.json(user);
});

export default router;
