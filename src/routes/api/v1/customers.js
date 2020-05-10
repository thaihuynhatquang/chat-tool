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

router.delete('/:customerId/tags/:tagId', async (req, res) => {
  const { tagId } = req.params;
  const { id: creator } = req.user;
  const [customer, tag] = await Promise.all([db.Customer.findByPk(req.params.customerId), db.Tag.findByPk(tagId)]);
  if (!customer || !tag) {
    return res.status(404).send('Can not find customer or tag');
  }
  const numberEffect = await customer.removeTag(tag);
  if (numberEffect === 0) res.status(404).send('Can not find tag');
  return res.sendStatus(200);
});

router.post('/:customerId/notes', async (req, res) => {
  const { content } = req.body;
  const { id: creator } = req.user;
  const customer = await db.Customer.findByPk(req.params.customerId);
  if (!customer) return res.status(404).send('Can not find customer');
  const { id: noteId } = await customer.createNote({
    content,
    creator,
  });
  const note = await db.Note.scope('withUser').findByPk(noteId);
  return res.json(note);
});

router.put('/:customerId/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;
  await db.Note.update(
    { content },
    {
      where: { id: noteId },
    },
  );
  const note = await db.Note.scope('withUser').findByPk(noteId);
  if (!note) return res.status(404).send('Can not find note');
  return res.json(note);
});

router.delete('/:customerId/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;
  const { id: creator } = req.user;
  const numberEffect = await db.Note.destroy({
    where: { id: noteId },
  });

  if (numberEffect === 0) res.status(404).send('Can not find note');
  return res.sendStatus(200);
});

export default router;
