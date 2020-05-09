import { Router } from 'express';
import startChannels from 'core/startChannels';
import { getCommentAttachmentData } from 'utils/graph';
import { MESSENGER_CHANNEL_TYPE, FBCOMMENT_CHANNEL_TYPE } from 'constants';

const debug = require('debug')('routes:webhookFB');

const router = new Router();

router.get('/', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.WEBHOOK_FB_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

router.post('/', async (req, res) => {
  const { body: data } = req;
  if (data.object !== 'page') return;

  const channels = await startChannels();

  // Iterate over each entry. There may be multiple if batched.
  data.entry.forEach((entry) => {
    // Iterate over each messaging event
    const { id: pageId } = entry;
    const type = entry.messaging ? MESSENGER_CHANNEL_TYPE : FBCOMMENT_CHANNEL_TYPE;
    const channel = channels[type][pageId];

    if (!channel) return;
    const emitMessage = (data, type) => channel.onMessage({ ...data, type });
    const emitEvent = (data, type) => channel.onEvent({ ...data, type });

    if (entry.messaging) {
      entry.messaging.forEach((event) => {
        event.pageId = pageId;
        if (event.message && event.message.text) {
          emitMessage(event, 'message');
        } else if (event.message && event.message.attachments) {
          emitMessage(event, 'attachment');
        } else if (event.postback) {
          // TODO: Handle messenger postback
        } else if (event.delivery) {
          // TODO: Handle messenger delivery
        } else if (event.read) {
          emitEvent(event, 'read');
        } else if (event.account_linking) {
          // TODO: Handle messenger account linking
        } else if (event.referral) {
          // TODO: Handle messenger referral
        } else {
          debug(`Webhook received unknown event: ${event}`);
        }
      });
    } else if (entry.changes) {
      entry.changes.forEach(async (change) => {
        if (change.field !== 'feed' || !change.value) {
          return;
        }
        const event = change.value;
        event.pageId = pageId;
        if (event.item === 'comment') {
          if (event.verb === 'remove') {
            emitEvent(event, 'remove_comment');
          } else {
            const { attachment } = await getCommentAttachmentData(event.comment_id, channel.accessToken);
            event.attachment = attachment && { ...attachment };
            if (event.verb === 'add') emitMessage(event, 'add_comment');
            else if (event.verb === 'edited') {
              emitEvent(event, 'edited_comment');
            }
          }
        } else if (['post', 'status', 'event', 'photo', 'video', 'share'].includes(event.item)) {
          if (['add', 'remove', 'edited'].includes(event.verb)) {
            emitEvent(event, `${event.verb}_post`);
          } else {
            debug(`Webhook received unknown event: ${event}`);
          }
        }
      });
    }
  });

  res.sendStatus(200);
});

export default router;
