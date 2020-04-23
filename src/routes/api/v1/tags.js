import { Router } from 'express';
import db from 'models';

const router = new Router();

router.get('/', async (req, res) => {
  const { limit, offset } = req.query;
  const { rows: tags, count } = await db.Tag.findAndCountAll({ limit, offset });
  return res.json({ count, data: tags });
});

router.get('/:tagId', async (req, res) => {
  const tag = await db.Tag.findByPk(req.params.tagId);
  if (!tag) return res.status(404).send('Can not find Tag');
  return res.json(tag);
});

router.get('/:tagId/customers', async (req, res) => {
  const { limit, offset } = req.query;
  const tag = await db.Tag.findByPk(req.params.tagId);
  if (!tag) return res.status(404).send('Can not find Tag');
  const [count, customers] = await Promise.all([tag.countCustomers(), tag.getCustomers({ limit, offset })]);

  return res.json({ count, data: customers });
});

router.post('/', async (req, res) => {
  const { content, color } = req.body;
  const {
    user: { id: creator },
  } = req;
  const tag = await db.Tag.create({
    content,
    color,
    creator,
  });
  return res.json(tag);
});

router.delete('/:tagId', async (req, res) => {
  await db.Tag.destroy({ where: { id: req.params.tagId } });
  return res.sendStatus(204);
});

export default router;
