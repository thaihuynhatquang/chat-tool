import FormData from 'form-data';
import fs from 'fs';
import db from 'models';
import InstantMessage from './interface';
import { formatTime } from 'utils/time';
import { THREAD_STATUS_PROCESSING } from 'constants';
import { getUserProfileFB, getPostInformation, postComment } from 'utils/graph';
import * as calculateInferenceField from '../triggers/calculateInferenceField';
import client from 'config/redis';

const debug = require('debug')('app:im:fbcomment');

const extractPhotos = (post) => {
  const { attachments, type, source } = post;

  let photos = [];
  if (type === 'video') photos.push(source);
  else if (type === 'photo') {
    attachments.data.forEach((att) => {
      if (att.hasOwnProperty('subattachments')) {
        att.subattachments.data.forEach((att) => {
          photos.push(att.media.image.src);
        });
      } else {
        photos.push(att.media.image.src);
      }
    });
  }

  return photos;
};
class FBComment extends InstantMessage {
  constructor(channel, app) {
    super(channel, app);
    debug(`Init FBComment channel ${channel.title}`);
    let {
      configs: { accessToken },
    } = channel;
    if (!accessToken) {
      throw new Error('Require accessToken to create FBComment IM');
    }
    this.channel = channel;
    this.accessToken = accessToken;
  }

  _getAdditionData = (message) => {
    const { post, video, photo, attachment } = message;
    const attachments = photo
      ? [{ type: 'image', payload: { url: photo } }]
      : video
      ? [{ type: 'video', payload: { url: video } }]
      : attachment
      ? [{ type: attachment.type, payload: { ...attachment } }]
      : null;
    return {
      ...(attachments && { attachments }),
      post,
    };
  };

  _createOrUpdateThread = async (postId, pageId) => {
    const postInfo = await getPostInformation(postId, this.accessToken);
    const {
      type,
      from,
      from: { name: actorName, id: actorId },
      permalink_url: url,
      message: content,
      link,
    } = postInfo;

    let actorInfo = await db.Customer.findOne({
      where: { channelId: this.channel.id, uniqueKey: actorId },
    });
    if (!actorInfo) {
      const profile = await getUserProfileFB(actorId, this.accessToken);
      actorInfo = await db.Customer.create({
        channelId: this.channel.id,
        uniqueKey: actorId,
        name: actorName,
        additionData: {
          avatarUrl: profile.picture.data.url,
        },
      });
    }

    return db.Thread.upsert({
      channelId: this.channel.id,
      uniqueKey: postId,
      title: actorId === pageId && content ? content : actorName,
      status: THREAD_STATUS_PROCESSING,
      additionData: {
        from,
        type,
        content,
        link,
        photos: extractPhotos(postInfo),
        url,
        avatarUrl: actorInfo.additionData.avatarUrl,
      },
    });
  };

  getOrCreateThreadByMsg = async (message) => {
    const { post_id: uniqueKey, pageId } = message;
    const thread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });
    if (thread) return { thread, isCreated: false };

    await this._createOrUpdateThread(uniqueKey, pageId);
    const newThread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });
    return { thread: newThread, isCreated: true };
  };

  getOrCreateCustomerByMsg = async (message) => {
    const {
      from: { id: uniqueKey, name },
    } = message;
    const customer = await db.Customer.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });
    if (customer) return { customer, isCreated: false };
    const profile = await getUserProfileFB(uniqueKey, this.accessToken);

    const newCustomer = await db.Customer.create({
      channelId: this.channel.id,
      uniqueKey,
      name,
      additionData: {
        avatarUrl: profile.picture.data.url,
      },
    });
    return { customer: newCustomer, isCreated: true };
  };

  getFormattedMessage = async (message, thread, customer) => {
    const {
      from: { id: senderId },
      comment_id: mid,
      post_id: postId,
      parent_id: parentId,
      created_time: createdAt,
      message: content,
    } = message;
    const additionData = this._getAdditionData(message);

    const userId = await client.getAsync(mid);

    return {
      mid,
      threadId: thread.id,
      customerId: customer.id,
      userId,
      isVerified: senderId === this.channel.uniqueKey,
      parentId: parentId === postId ? null : parentId,
      additionData,
      content,
      msgCreatedAt: formatTime(createdAt * 1000),
    };
  };

  triggerOnHandleMessage = async (savedMessage, thread) => {
    const oldMissCount = thread.missCount;
    await calculateInferenceField.twoLevel(savedMessage, thread);
    const missCountChange = thread.missCount - oldMissCount;
    this.emitSocketNewMessage(savedMessage, thread, missCountChange);
  };

  onEvent = async (event) => {
    debug(`Receive event ${event.type}:\n${JSON.stringify(event, null, 2)}`);
    switch (event.type) {
      case 'edited_comment':
        return this.editComment(event);
      case 'remove_comment':
        return this.deleteComment(event);
      case 'add_post':
        return this.addPost(event);
      case 'edited_post':
        return this.editPost(event);
      case 'remove_post':
        return this.deletePost(event);
      default:
        debug('Why are we here???');
    }
  };

  editComment = async (message) => {
    const { message: content, comment_id: mid, created_time: updatedTime } = message;
    const additionData = this._getAdditionData(message);
    return db.Message.update(
      { content, additionData, updatedTime: formatTime(updatedTime * 1000) },
      { where: { mid } },
    );
  };

  deleteComment = async (message) => {
    const { comment_id: mid, created_time: msgDeletedAt } = message;
    db.ThreadInferenceData.update({ missCount: 0, missTime: null }, { where: { uniqueKey: mid } });
    return db.Message.update(
      { msgDeletedAt: formatTime(msgDeletedAt * 1000) },
      { where: { [db.Sequelize.Op.or]: [{ mid }, { parentId: mid }] } },
    );
  };

  addPost = async (message) => {
    const { post_id: postId, pageId } = message;
    return this._createOrUpdateThread(postId, pageId);
  };

  editPost = async (message) => {
    const { post_id: postId, pageId } = message;
    return this._createOrUpdateThread(postId, pageId);
  };

  deletePost = async (message) => {
    const { post_id: uniqueKey, created_time: deletedAt } = message;
    return db.Thread.update(
      { deletedAt: formatTime(deletedAt * 1000) },
      { where: { channelId: this.channel.id, uniqueKey } },
    );
  };

  sendMessage = async (sendData) => {
    const { message, attachment, target: postId, parentId, userId } = sendData;
    debug(`Publish Comment to: ${postId}\n${JSON.stringify(sendData, null, 2)}`);
    const commentId = parentId || postId;
    const formData = new FormData();
    formData.append('message', message);
    if (attachment) {
      formData.append('source', fs.createReadStream(attachment.path));
    }
    const result = await postComment(formData, commentId, this.accessToken);

    if (result.success) client.set(result.response.id, userId);

    return result;
  };
}

export default FBComment;
