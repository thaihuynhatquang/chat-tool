import { Router } from "express";
import db from "models";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";

const router = new Router();

router.get(
  "/:tagId",
  asyncMiddleware(async (req, res) => {
    const tag = await db.Tag.findByPk(req.params.tagId);
    if (!tag) return res.status(404).send("Can not find Tag");
    return res.json(tag);
  })
);

router.get(
  "/:tagId/customers",
  asyncMiddleware(async (req, res) => {
    const { limit, offset } = req.query;
    const tag = await db.Tag.findByPk(req.params.tagId);
    if (!tag) return res.status(404).send("Can not find Tag");
    const [count, customers] = await Promise.all([
      tag.countCustomers(),
      tag.getCustomers({ limit, offset }),
    ]);

    return res.json({ count, data: customers });
  })
);

router.delete(
  "/:tagId",
  asyncMiddleware(async (req, res) => {
    await db.Tag.destroy({ where: { id: req.params.tagId } });
    return res.sendStatus(204);
  })
);

router.put(
  "/:tagId",
  asyncMiddleware(async (req, res) => {
    const { tagId } = req.params;
    const { color, content } = req.body;
    const tag = await db.Tag.findByPk(tagId);
    if (!tag) {
      return res.sendStatus(404);
    }

    await tag.update({
      color,
      content,
    });

    return res.json(tag);
  })
);

export default router;
