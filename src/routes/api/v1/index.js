import { Router } from "express";
import channels from "./channels";
import threads from "./threads";
import customers from "./customers";
import messages from "./messages";
import users from "./users";
import tags from "./tags";
import quickReplies from "./quickReplies";
import transferThreads from "./transferThreads";

const router = new Router();

router.use("/channels", channels);
router.use("/threads", threads);
router.use("/customers", customers);
router.use("/messages", messages);
router.use("/users", users);
router.use("/tags", tags);
router.use("/quickReplies", quickReplies);
router.use("/transfer-threads", transferThreads);

export default router;
