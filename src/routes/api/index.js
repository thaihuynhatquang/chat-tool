import { Router } from 'express'
import { handleLimitOffset } from '../middleware/handleLimitOffset'
import channels from './channels'
import threads from './threads'
import customers from './customers'
import messages from './messages'
import users from './users'
import tags from './tags'
import notes from './notes'

const router = new Router()

router.use(handleLimitOffset)
router.use('/channels', channels)
router.use('/threads', threads)
router.use('/customers', customers)
router.use('/messages', messages)
router.use('/users', users)
router.use('/tags', tags)
router.use('/notes', notes)

export default router
