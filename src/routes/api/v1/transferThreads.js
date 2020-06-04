import { Router } from "express";
import db from "models";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";

const router = new Router();

router.put(
  "/:transferThreadId/",
  asyncMiddleware(async (req, res) => {
    const { transferThreadId } = req.params;
    const { id: userId } = req.user;
    const { status } = req.body;
    const transferThread = await db.TransferThread.findByPk(transferThreadId);
    if (!transferThread) return res.sendStatus(404);
    if (transferThread.toUserId !== userId) return res.sendStatus(400);
    await transferThread.update({ status });
    if (status === "accept") {
      const thread = await transferThread.getThread();
      await thread.setUsersServing(transferThread.toUserId);
      await thread.addUsersHistory(transferThread.toUserId, {
        through: { updatedAt: new Date() },
      });
    }
    res.sendStatus(200);
  })
);

export default router;
