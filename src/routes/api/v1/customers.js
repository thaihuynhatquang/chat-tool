import { Router } from 'express';
import db from 'models';

const router = new Router();

router.get('/', async (req, res) => {
  const { limit, offset } = req.query;
  const { count, rows: customers } = await db.Customer.findAndCountAll({
    raw: true,
    limit,
    offset,
  });
  return res.json({ count, data: customers });
});

router.get('/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const customer = await db.Customer.findByPk(customerId);
  if (!customer) return res.status(404).send('Can not find customer');
  return res.json(customer);
});

router.get('/:customerId/tags', async (req, res) => {
  const { limit, offset } = req.query;
  const customer = await db.Customer.findByPk(req.params.customerId);
  if (!customer) return res.status(404).send('Can not find customer');
  const [count, tags] = await Promise.all([customer.countTags(), customer.getTags({ limit, offset })]);
  return res.json({ count, data: tags });
});

router.get('/:customerId/notes', async (req, res) => {
  const { limit, offset } = req.query;
  const customer = await db.Customer.findByPk(req.params.customerId);
  if (!customer) return res.status(404).send('Can not find customer');
  const [count, notes] = await Promise.all([customer.countNotes(), customer.getNotes({ limit, offset })]);
  return res.json({ count, data: notes });
});

router.put('/:customerId', async (req, res) => {
  const { phone, name } = req.body;
  const { customerId } = req.params;
  const newInfo = !phone ? (!name ? null : { name }) : !name ? { phone } : { phone, name };
  if (!newInfo) res.sendStatus(400);
  await db.Customer.update(
    {
      ...newInfo,
    },
    {
      where: { id: customerId },
    },
  );
  const customer = await db.Customer.findByPk(customerId);
  if (!customer) return res.status(404).send('Can not find customer');
  return res.json(customer);
});

router.post('/:customerId/tags', async (req, res) => {
  const { tagId } = req.body;
  const { id: creator } = req.user;
  const [customer, tag] = await Promise.all([db.Customer.findByPk(req.params.customerId), db.Tag.findByPk(tagId)]);
  if (!customer || !tag) {
    return res.status(404).send('Can not find customer or tag');
  }
  await customer.addTag(tag, { through: { creator } });
  return res.json({ creator, customerId: customer.id, tagId: tag.id });
});

router.post('/:customerId/tags', async (req, res) => {
  const { content } = req.body;
  const { id: creator } = req.user;
  const customer = await db.Customer.findByPk(req.params.customerId);
  if (!customer) return res.status(404).send('Can not find Customer');
  const note = await customer.createNote({ content, creator });
  return res.json(note);
});

export default router;
