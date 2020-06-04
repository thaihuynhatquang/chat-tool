import { Router } from "express";
import cors from "cors";
import handleLimitOffset from "routes/middlewares/handleLimitOffset";
import authenticate from "routes/middlewares/authenticate";
import { loggingRequest } from "routes/middlewares/logging";
import v1 from "./v1";
import db from "models";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";
import checkAuth from "utils/authenticate";
import { getAccessToken } from "utils/common";

const router = new Router();

router.use(cors());

router.get(
  "/invitation-link",
  asyncMiddleware(async (req, res) => {
    const accessToken = getAccessToken(req);
    const redirectToIam = () => {
      const iamUrl = process.env.IAM_API_URL;
      const currentLink = `${req.protocol}://${req.get("host")}${
        req.originalUrl
      }`;
      if (iamUrl) {
        return res.redirect(`${iamUrl}/web/login?redirect_url=${currentLink}`);
      }
      return res.sendStatus(401);
    };
    if (!accessToken) {
      return redirectToIam();
    }
    const user = await checkAuth(accessToken);
    if (!user) return redirectToIam();
    const userId = user.id;
    const { token } = req.query;
    if (typeof token !== "string") return res.sendStatus(400);

    try {
      const { channelId, roleIds } = signature.verify(token);
      const channelPromise = await db.Channel.findByPk(channelId);
      const userPromise = await db.User.findByPk(userId);
      const channel = await channelPromise;
      const user = await userPromise;
      if (!channel || !user) return res.sendStatus(404);
      await Promise.all([channel.addUser(userId), user.addRoles(roleIds)]);
      return res.redirect("/");
    } catch (error) {
      return res.status(410).send(error);
    }
  })
);

router.use(authenticate);
router.use(handleLimitOffset);
router.use(loggingRequest);

router.use("/v1", v1);

export default router;
