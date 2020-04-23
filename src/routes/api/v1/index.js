import { Router } from 'express';
import channels from './channels';
import threads from './threads';
import customers from './customers';
import users from './users';
import tags from './tags';
import notes from './notes';

const router = new Router();

router.use('/channels', channels);
router.use('/threads', threads);
router.use('/customers', customers);
router.use('/users', users);
router.use('/tags', tags);
router.use('/notes', notes);

export default router;
