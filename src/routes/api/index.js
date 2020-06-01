import { Router } from 'express';
import cors from 'cors';
import handleLimitOffset from 'routes/middlewares/handleLimitOffset';
import authorize from 'routes/middlewares/authorize';
import v1 from './v1';

const router = new Router();

const safe = (func) => (req, res, next) => {
  try {
    func(req, res, next);
  } catch (err) {
    next(err);
  }
};

router.use(cors());
router.use(safe(authorize));
router.use(safe(handleLimitOffset));

router.use('/v1', v1);

export default router;
