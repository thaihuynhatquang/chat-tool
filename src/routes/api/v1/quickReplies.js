import { Router } from "express";
import db from "models";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";

const router = new Router();

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const quickReplies = await req.user.getQuickReplies();
    return res.json({ count: quickReplies.length, data: quickReplies });
  })
);

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { id: userId } = req.user;
    const { content } = req.body;

    const quickReply = await db.QuickReply.create({
      userId,
      content,
    });
    return res.json(quickReply);
  })
);

router.delete(
  "/:quickReplyId",
  asyncMiddleware(async (req, res) => {
    const { quickReplyId } = req.params;
    await db.QuickReply.destroy({
      where: {
        id: quickReplyId,
      },
    });
    return res.sendStatus(204);
  })
);

export default router;
