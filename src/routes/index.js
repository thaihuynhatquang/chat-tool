import { Router } from "express";
import webhookFB from "routes/webhookFB";
import api from "routes/api";
import { loggingRequest } from "routes/middlewares/logging";

const router = new Router();

router.get("/health", async (req, res) => {
  res.send("OK");
});
router.use("/webhook-fb", loggingRequest, webhookFB);

router.use("/api", api);

export default router;
