import { Router } from 'express';
import db from 'models';
import asyncMiddleware from 'routes/middlewares/asyncMiddleware';

const router = new Router();

/**
 * @api {get} /customers 0. Get all customers
 * @apiName GetCustomers
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiUse LimitOffset
 * @apiSuccess {Number} count Total number of customers
 * @apiSuccess {Array[]} data List all customers.<br/>See <a href="#api-Customer-GetCustomer">Customer detail</a>
 * @apiUse GetCustomersResponse
 */
router.get(
  '/',
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const { count, rows: customers } = await db.Customer.findAndCountAll({
      raw: true,
      limit,
      offset,
    });
    return res.json({ count, data: customers });
  }),
);

/**
 * @api {get} /customers/:customerId 1. Get detail of a Customer
 * @apiName GetCustomer
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {Number} customerId Customer unique ID
 * @apiSuccess {Number} id Unique id of customer
 * @apiSuccess {Number} channelId id of channel which customer belongs to
 * @apiSuccess {String} uniqueKey Unique key with each customer (example: facebookId for facebook user)
 * @apiSuccess {String} name Name of customer
 * @apiSuccess {String} phone Phone number of customer
 * @apiSuccess {Object} additionData Some extra infomation of the customer (avatarUrl,...)
 * @apiUse GetCustomerResponse
 */
router.get(
  '/:customerId',
  asyncMiddleware(async (req, res) => {
    const { customerId } = req.params;
    const customer = await db.Customer.findByPk(customerId);
    if (!customer) return res.status(404).send('Can not find customer');
    return res.json(customer);
  }),
);

/**
 * @api {get} /customers/:customerId/tags 3. Get all tags of a Customer
 * @apiName GetCustomerTag
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {Number} customerId Customer unique ID
 * @apiUse LimitOffset
 * @apiSuccess {Number} count Total number tags of a customer
 * @apiSuccess {Array[]} data List all tags of a customer.<br/>See <a href="#api-Tag-GetTag">Tag detail</a>
 * @apiUse GetCustomerTagResponse
 */
router.get(
  '/:customerId/tags',
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const customer = await db.Customer.findByPk(req.params.customerId);
    if (!customer) return res.status(404).send('Can not find customer');
    const [count, tags] = await Promise.all([customer.countTags(), customer.getTags({ limit, offset })]);
    return res.json({ count, data: tags });
  }),
);

/**
 * @api {get} /customers/:customerId/notes 6. Get all notes of a Customer
 * @apiName GetCustomerNote
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {Number} customerId Customer unique ID
 * @apiUse LimitOffset
 * @apiSuccess {Number} count Total number notes of a customer
 * @apiSuccess {Array} data List all notes of a customer
 * @apiUse GetCustomerNoteResponse
 */
router.get(
  '/:customerId/notes',
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const customer = await db.Customer.findByPk(req.params.customerId);
    if (!customer) return res.status(404).send('Can not find customer');
    const [count, notes] = await Promise.all([customer.countNotes(), customer.getNotes({ limit, offset })]);
    return res.json({ count, data: notes });
  }),
);

/**
 * @api {put} /customers/:customerId 2. Edit customer info
 * @apiName EditCustomer
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {Number} customerId Customer unique ID
 * @apiParam {String} phone phone number of customer
 * @apiParam {String} name name of customer
 * @apiSuccess {Number} id Unique id of customer
 * @apiSuccess {Number} channelId id of channel which customer belongs to
 * @apiSuccess {String} uniqueKey Unique key with each customer (example: facebookId for facebook user)
 * @apiSuccess {String} name Name of customer
 * @apiSuccess {String} phone Phone number of customer
 * @apiSuccess {Object} additionData Some extra infomation of the customer (avatarUrl,...)
 * @apiUse EditCustomerResponse
 */
router.put(
  '/:customerId',
  asyncMiddleware(async (req, res) => {
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
  }),
);

/**
 * @api {post} /customers/:customerId/tags 4. Add tag to a customer
 * @apiName AddCustomerTag
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {Number} customerId Customer unique ID
 * @apiParam {Number} tagId Id of the tag
 * @apiSuccess {Number} creator Id of user who add this tag to customer
 * @apiSuccess {Number} customerId Id of customer who the tag was added
 * @apiSuccess {Number} tagId Id of tag which was added to customer
 * @apiUse AddCustomerTagResponse
 */
router.post(
  '/:customerId/tags',
  asyncMiddleware(async (req, res) => {
    const { tagId } = req.body;
    const { id: creator } = req.user;
    const [customer, tag] = await Promise.all([db.Customer.findByPk(req.params.customerId), db.Tag.findByPk(tagId)]);
    if (!customer || !tag) {
      return res.status(404).send('Can not find customer or tag');
    }
    await customer.addTag(tag, { through: { creator } });
    return res.json({ creator, customerId: customer.id, tagId: tag.id });
  }),
);

/**
 * @api {delete} /customers/:customerId/tags 5. Delete a tag customer
 * @apiName Delete CustomerTag
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {Number} customerId Customer unique ID
 * @apiParam {Number} tagId Id of the tag
 */
router.delete(
  '/:customerId/tags/:tagId',
  asyncMiddleware(async (req, res) => {
    const { tagId } = req.params;
    const [customer, tag] = await Promise.all([db.Customer.findByPk(req.params.customerId), db.Tag.findByPk(tagId)]);
    if (!customer || !tag) {
      return res.status(404).send('Can not find customer or tag');
    }
    const numberEffect = await customer.removeTag(tag);
    if (numberEffect === 0) res.status(404).send('Can not find tag');
    return res.sendStatus(204);
  }),
);

/**
 * @api {post} /customers/:customerId/notes 7. Add a new note for customer
 * @apiName AddCustomerNote
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {String} content Content of the notes
 * @apiSuccess {Number} id Unique id of note
 * @apiSuccess {String} content Content of note
 * @apiSuccess {Number} creator Id of user who created this note
 * @apiSuccess {Object} user info of creator. See <a href="#api-User-GetUser">user detail</a>
 * @apiUse AddCustomerNoteResponse
 */
router.post(
  '/:customerId/notes',
  asyncMiddleware(async (req, res) => {
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
  }),
);

/**
 * @api {put} /customers/:customerId/notes 8. Edit content of a note
 * @apiName EditCustomerNote
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {String} content Content of the notes
 * @apiParam {Number} noteId  Id of Note
 * @apiSuccess {Object} Result Same with <a href="#api-Customer-AddCustomerNote">add new note to customer</a>
 * @apiUse AddCustomerNoteResponse
 */
router.put(
  '/:customerId/notes/:noteId',
  asyncMiddleware(async (req, res) => {
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
  }),
);

/**
 * @api {delete} /customers/:customerId/notes/:noteId 9. Delete a note customer
 * @apiName DeleteCustomerNote
 * @apiGroup Customer
 * @apiVersion 1.0.0
 * @apiParam {Number} id Id of the notes
 */
router.delete(
  '/:customerId/notes/:noteId',
  asyncMiddleware(async (req, res) => {
    const { noteId } = req.params;
    const numberEffect = await db.Note.destroy({
      where: { id: noteId },
    });

    if (numberEffect === 0) res.status(404).send('Can not find note');
    return res.sendStatus(204);
  }),
);

export default router;
