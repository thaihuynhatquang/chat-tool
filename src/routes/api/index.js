import cors from "cors";
import { Router } from "express";
import db from "models";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";
import authenticate from "routes/middlewares/authenticate";
import handleLimitOffset from "routes/middlewares/handleLimitOffset";
import { loggingRequest } from "routes/middlewares/logging";
import checkAuth from "utils/authenticate";
import signature from "utils/signature";
import v1 from "./v1";

const router = new Router();

router.use(cors());

router.get(
  "/invitation-link",
  asyncMiddleware(async (req, res) => {
    const tokenPattern = "Bearer ";
    const accessToken =
      req.cookies.access_token ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith(tokenPattern) &&
        req.headers.authorization.substring(tokenPattern.length));
    req.cookies.access_token || req.headers.authorization;
    if (!accessToken) {
      return res.sendStatus(401);
    }
    const user = await checkAuth(accessToken);
    if (!user) return res.sendStatus(401);
    const userId = user.id;
    const { token } = req.query;
    if (typeof token !== "string") return res.sendStatus(400);

    try {
      const { channelId, roleIds } = signature.verify(token);
      console.log(userId);
      const channelPromise = await db.Channel.findByPk(channelId);
      const userPromise = await db.User.findByPk(userId);
      const channel = await channelPromise;
      const user = await userPromise;
      if (!channel || !user) return res.sendStatus(404);
      await Promise.all([channel.addUser(userId), user.addRoles(roleIds)]);
      return res.redirect("http://127.0.0.1:8000");
    } catch (error) {
      console.log(error);
      return res.status(410).send(error);
    }
  })
);

router.use(authenticate);
router.use(handleLimitOffset);
router.use(loggingRequest);

router.use("/v1", v1);

export default router;
