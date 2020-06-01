import { Router } from 'express';
import db from 'models';
import asyncMiddleware from 'routes/middlewares/asyncMiddleware';

const router = new Router();

/**
 * @api {get} /users 0. Get all users
 * @apiName GetUsers
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiParam {Number} [limit] Limit result data. Max: 100
 * @apiParam {Number} [offset] Offset. Default: 0
 * @apiSuccess {Number} count Total number of users
 * @apiSuccess {Array[]} data List all users. See <a href="#api-User-GetUser">user detail</a>
 * @apiUse GetUsersResponse
 */
router.get(
  '/',
  asyncMiddleware(async (req, res) => {
    const users = await db.User.findAndCountAll();
    return res.json({ count: users.count, data: users.rows });
  }),
);

/**
 * @api {get} /users/me 1. Get detail of current user
 * @apiName GetMe
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiSuccess {Number} id of channel
 * @apiSuccess {String} name Name of user
 * @apiSuccess {String} email User email
 * @apiSuccess {String} phone User phone number
 * @apiSuccess {Date} dob User birthday
 * @apiSuccess {String} avatarUrl Link to image - avatar of user
 * @apiSuccess {String} department User department
 * @apiSuccess {String} position User position
 * @apiSuccess {DateTime} createdAt User created time
 * @apiSuccess {DateTime} createdAt User updated time
 * @apiUse GetUserResponse
 */
router.get(
  '/me',
  asyncMiddleware(async (req, res) => {
    const user = await db.User.findByPk(req.user.id);
    return res.json(user);
  }),
);

/**
 * @api {get} /users/:userId 2. Get detail of a user
 * @apiName GetUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiParam {Number} channelId Channel unique ID
 * @apiSuccess {Number} id of channel
 * @apiSuccess {String} name Name of user
 * @apiSuccess {String} email User email
 * @apiSuccess {String} phone User phone number
 * @apiSuccess {Date} dob User birthday
 * @apiSuccess {String} avatarUrl Link to image - avatar of user
 * @apiSuccess {String} department User department
 * @apiSuccess {String} position User position
 * @apiSuccess {DateTime} createdAt User created time
 * @apiSuccess {DateTime} createdAt User updated time
 * @apiUse GetUserResponse
 */
router.get(
  '/:userId',
  asyncMiddleware(async (req, res) => {
    const user = await db.User.findByPk(req.params.userId);
    return res.json(user);
  }),
);

export default router;
