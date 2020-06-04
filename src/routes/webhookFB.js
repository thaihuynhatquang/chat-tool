import { Router } from "express";
import uuidv4 from "uuid/v4";
import startChannels from "core/startChannels";
import { MESSENGER_CHANNEL_TYPE, FBCOMMENT_CHANNEL_TYPE } from "constants";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";
import { getCommentAttachmentData } from "utils/graph";

const debug = require("debug")("routes:webhookFB");

const router = new Router();

router.get("/", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === process.env.WEBHOOK_FB_VERIFY_TOKEN
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

router.post(
  "/",
  asyncMiddleware(async (req, res, next) => {
    const data = req.body;
    if (data.object !== "page") return res.sendStatus(400);

    const channels = await startChannels();

    // Iterate over each entry. There may be multiple if batched.
    data.entry.forEach((entry) => {
      // Iterate over each messaging event
      const { id: pageId } = entry;
      const type = entry.messaging
        ? MESSENGER_CHANNEL_TYPE
        : FBCOMMENT_CHANNEL_TYPE;
      const channelIM = channels[type] && channels[type][pageId];

      if (!channelIM) return;
      const emitMessage = async (data, type) =>
        channelIM.onMessage({ ...data, type }).catch(next);
      const emitEvent = (data, type) =>
        channelIM.onEvent({ ...data, type }).catch(next);

      if (entry.messaging) {
        entry.messaging.forEach((event) => {
          event.pageId = pageId;
          if (event.message && event.message.text) {
            emitMessage(event, "message");
          } else if (event.message && event.message.attachments) {
            emitMessage(event, "attachment");
          } else if (event.postback) {
            emitMessage(
              {
                ...event,
                message: {
                  mid: `postback_${uuidv4()}`,
                  // $FlowFixMe
                  text: event.postback.title,
                },
              },
              "message"
            );
          } else if (event.delivery) {
            // TODO: Handle messenger delivery
          } else if (event.read) {
            emitEvent(event, "read");
          } else if (event.account_linking) {
            // TODO: Handle messenger account linking
          } else if (event.referral) {
            // TODO: Handle messenger referral
          } else {
            debug("Webhook received unknown event", event);
          }
        });
      } else if (entry.changes) {
        entry.changes.forEach(async (change) => {
          if (change.field !== "feed" || !change.value) {
            return;
          }
          const event = change.value;
          event.pageId = pageId;
          if (event.item === "comment") {
            if (event.verb === "remove") {
              emitEvent(event, "remove_comment");
            } else {
              // TODO: Shouldn't await getting attachment here.
              // It also might throw error
              //  => Webhook not response status code 200
              //    => Facebook auto unsubscribe our webhook.
              const { attachment } = await getCommentAttachmentData(
                event.comment_id,
                channelIM.accessToken
              );
              event.attachment = attachment && { ...attachment };
              if (event.verb === "add") emitMessage(event, "add_comment");
              else if (event.verb === "edited") {
                emitEvent(event, "edited_comment");
              }
            }
          } else if (
            ["post", "status", "event", "photo", "video", "share"].includes(
              event.item
            )
          ) {
            if (
              ["add", "remove", "edited"].includes(event.verb) &&
              event.published !== 0
            ) {
              emitEvent(event, `${event.verb}_post`);
            } else {
              debug("Webhook received unknown event", event);
            }
          }
        });
      }
    });

    res.sendStatus(200);
  })
);

export default router;
