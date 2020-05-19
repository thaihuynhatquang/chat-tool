import { Router } from 'express';
import db from 'models';

const router = new Router();
const { Op } = db.Sequelize;

/**
 * @api {get} /tags/ 0. Get all tags
 * @apiName GetTags
 * @apiGroup Tag
 * @apiUse LimitOffset
 * @apiVersion 1.0.0
 * @apiParam {String} [content] String to filter tags
 * @apiSuccess {Number} count Total number tags
 * @apiSuccess {Array[]} data List all tags. See <a href="#api-Tag-GetTag">tag detail</a>
 * @apiUse GetTagsResponse
 */
router.get('/', async (req, res) => {
  const { content = '', limit, offset } = req.query;
  const { rows: tags, count } = await db.Tag.findAndCountAll({
    where: { content: { [Op.like]: `%${content}%` } },
    limit,
    offset,
  });
  return res.json({ count, data: tags });
});

/**
 * @api {get} /tags/:tagId 1. Get detail of a tag
 * @apiName GetTag
 * @apiGroup Tag
 * @apiVersion 1.0.0
 * @apiParam {Number} tagId Id of the tag
 * @apiSuccess {Number} id tag ID
 * @apiSuccess {String} content Tag title
 * @apiSuccess {String} color Color code of tag
 * @apiSuccess {Number} creator Id of user who create this tag
 * @apiSuccess {DateTime} createdAt Created time of this tag
 * @apiSuccess {DateTime} updatedAt updated time of this tag
 * @apiUse GetTagResponse
 */
router.get('/:tagId', async (req, res) => {
  const tag = await db.Tag.findByPk(req.params.tagId);
  if (!tag) return res.status(404).send('Can not find Tag');
  return res.json(tag);
});

/**
 * @api {get} /tags/:tagId/customers 4. Get list customer who have this tag
 * @apiName GetTagCustomer
 * @apiGroup Tag
 * @apiVersion 1.0.0
 * @apiParam {Number} tagId Id of the tag
 * @apiUse LimitOffset
 * @apiSuccess {Number} count Total number customers who have this tag
 * @apiSuccess {Array[]} data List all customer who have this tag
 * @apiUse GetTagCustomerResponse
 */
router.get('/:tagId/customers', async (req, res) => {
  const { limit, offset } = req.query;
  const tag = await db.Tag.findByPk(req.params.tagId);
  if (!tag) return res.status(404).send('Can not find Tag');
  const [count, customers] = await Promise.all([tag.countCustomers(), tag.getCustomers({ limit, offset })]);

  return res.json({ count, data: customers });
});

/**
 * @api {post} /tags 2. Add a new tag
 * @apiName AddTag
 * @apiGroup Tag
 * @apiVersion 1.0.0
 * @apiParam {String} color Color code
 * @apiParam {String} content Content of the Tag
 * @apiSuccess {Number} id Unique id of tag
 * @apiSuccess {String} content Content of tag
 * @apiSuccess {String} color Color code of tag
 * @apiSuccess {Number} creator if of user who created this tag
 * @apiUse AddTagResponse
 */
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

/**
 * @api {delete} /tags/:tagId 3. Delete a tag
 * @apiName DeleteTag
 * @apiGroup Tag
 * @apiVersion 1.0.0
 * @apiParam {Number} tagId Id of the tag
 */
router.delete('/:tagId', async (req, res) => {
  await db.Tag.destroy({ where: { id: req.params.tagId } });
  return res.sendStatus(204);
});

export default router;
