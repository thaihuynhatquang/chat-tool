import client from "config/redis";
import { THREAD_STATUS_DONE, THREAD_STATUS_UNREAD } from "constants";
import * as calculateInferenceField from "core/triggers/calculateInferenceField";
import FormData from "form-data";
import fs from "fs";
import _ from "lodash";
import db from "models";
import {
  getPostInformation,
  getUserProfileFB,
  loadChannel,
  loadMessage,
  postComment,
} from "utils/graph";
import { formatTime } from "utils/time";
import InstantMessage from "./interface";
const debug = require("debug")("app:im:fbcomment");

const extractPhotos = (post) => {
  const { attachments, type, source } = post;

  let photos = [];
  if (type === "video") photos.push(source);
  else if (type === "photo") {
    attachments.data.forEach((att) => {
      if (att.hasOwnProperty("subattachments")) {
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
  channel;
  accessToken;

  constructor(channel) {
    super(channel);
    debug(`Init FBComment channel ${channel.title}`);
    let {
      configs: { accessToken },
    } = channel;
    if (!accessToken) {
      throw new Error("Require accessToken to create FBComment IM");
    }
    this.channel = channel;
    this.accessToken = accessToken;
  }

  _getAdditionData = (message) => {
    const { post, video, photo, attachment } = message;
    const attachments = photo
      ? [{ type: "image", payload: { url: photo } }]
      : video
      ? [{ type: "video", payload: { url: video } }]
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
          avatarUrl:
            profile &&
            profile.picture &&
            profile.picture.data &&
            profile.picture.data.url,
        },
      });
    }
    const thread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey: postId },
    });

    if (!thread) {
      return db.Thread.create({
        channelId: this.channel.id,
        uniqueKey: postId,
        title: actorId === pageId && content ? content : actorName,
        status: THREAD_STATUS_UNREAD,
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
    } else {
      thread.set("title", actorId === pageId && content ? content : actorName);
      thread.set("status", THREAD_STATUS_UNREAD);
      thread.set("additionData", {
        from,
        type,
        content,
        link,
        photos: extractPhotos(postInfo),
        url,
        avatarUrl: actorInfo.additionData.avatarUrl,
      });

      return thread.save();
    }
  };

  getOrCreateThreadByMsg = async (message) => {
    const { post_id: uniqueKey, pageId } = message;
    const thread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });
    if (thread) {
      if (thread.status === THREAD_STATUS_DONE) {
        thread.update({ status: THREAD_STATUS_UNREAD });
      }
      return { thread, isCreated: false };
    }

    await this._createOrUpdateThread(uniqueKey, pageId);
    const newThread = await db.Thread.findOne({
      where: { channelId: this.channel.id, uniqueKey },
    });
    if (!newThread) throw new Error("Thread not found");
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
        avatarUrl:
          profile &&
          profile.picture &&
          profile.picture.data &&
          profile.picture.data.url,
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
    const isExistsParentAsThread = !!(await db.Thread.findOne({
      where: { uniqueKey: parentId, channelId: this.channel.id },
    }));
    const isExistsParentAsMessage = !!(await db.Message.findOne({
      where: { mid: parentId },
    }));

    return {
      mid,
      threadId: thread.id,
      customerId: customer.id,
      userId,
      isVerified: senderId === this.channel.uniqueKey,
      parentId:
        parentId === postId || isExistsParentAsThread
          ? null
          : isExistsParentAsMessage
          ? parentId
          : null,
      additionData,
      content,
      msgCreatedAt: formatTime(createdAt * 1000),
    };
  };

  triggerOnHandleMessage = async (message, thread) => {
    calculateInferenceField.twoLevel(message, thread);
  };

  onEvent = async (event) => {
    debug(`Receive event ${event.type}:\n${JSON.stringify(event, null, 2)}`);
    switch (event.type) {
      case "edited_comment":
        return this.editComment(event);
      case "remove_comment":
        return this.deleteComment(event);
      case "add_post":
        return this.addPost(event);
      case "edited_post":
        return this.editPost(event);
      case "remove_post":
        return this.deletePost(event);
      default:
        debug("Why are we here???");
    }
  };

  editComment = async (message) => {
    const {
      message: content,
      comment_id: mid,
      created_time: updatedTime,
    } = message;
    const additionData = this._getAdditionData(message);
    await db.Message.update(
      { content, additionData, msgUpdatedAt: formatTime(updatedTime * 1000) },
      { where: { mid } }
    );
  };

  deleteComment = async (message) => {
    const { comment_id: mid, created_time: msgDeletedAt } = message;
    db.ThreadInferenceData.update(
      { missCount: 0, missTime: null },
      { where: { uniqueKey: mid } }
    );
    db.Message.update(
      { msgDeletedAt: formatTime(msgDeletedAt * 1000) },
      {
        where: { mid },
      }
    );
    db.Message.update(
      { msgDeletedAt: formatTime(msgDeletedAt * 1000) },
      {
        where: { parentId: mid },
      }
    );
  };

  addPost = async (message) => {
    const { post_id: postId, pageId } = message;
    await this._createOrUpdateThread(postId, pageId);
  };

  editPost = async (message) => {
    const { post_id: postId, pageId } = message;
    await this._createOrUpdateThread(postId, pageId);
  };

  deletePost = async (message) => {
    const { post_id: uniqueKey, created_time: deletedAt } = message;
    db.Thread.update(
      { deletedAt: formatTime(deletedAt * 1000) },
      { where: { channelId: this.channel.id, uniqueKey } }
    );
  };

  sendMessage = async (sendData) => {
    const { message, attachment, target: postId, parentId, userId } = sendData;
    debug(
      `Publish Comment to: ${postId}\n${JSON.stringify(sendData, null, 2)}`
    );
    const commentId = parentId || postId;
    const formData = new FormData();
    if (message) formData.append("message", message);
    if (attachment) {
      formData.append("source", fs.createReadStream(attachment.path));
    }
    const result = await postComment(formData, commentId, this.accessToken);

    if (result.success) client.set(result.response.id, userId);

    return result;
  };

  reloadChannel = async (channel) => {
    const channelInfo = await loadChannel(
      channel.uniqueKey,
      ["name", "picture"],
      this.accessToken
    );

    const {
      name,
      picture: {
        data: { url: avatarUrl },
      },
    } = channelInfo;

    const additionData = _.merge(channel.additionData, { name, avatarUrl });
    channel.set("additionData", additionData);
    return channel.save();
  };

  reloadMessage = async (message) => {
    const messageInfo = await loadMessage(
      message.mid,
      ["message", "attachment"],
      this.accessToken
    );

    const { message: content, attachment } = messageInfo;

    if (!attachment) return message;
    const {
      media: {
        image: { src: url },
      },
    } = attachment;

    const updateAttachment = [
      {
        type: "image",
        payload: {
          url,
        },
      },
    ];

    const additionData = _.merge(message.additionData, {
      attachments: updateAttachment,
    });
    message.set("content", content);
    message.set("additionData", additionData);

    return message.save();
  };

  reloadThread = async (thread) => {
    const threadInfo = await getPostInformation(
      thread.uniqueKey,
      this.accessToken
    );

    const additionData = _.merge(thread.additionData, {
      avatarUrl:
        threadInfo &&
        threadInfo.picture &&
        threadInfo.picture.data &&
        threadInfo.picture.data.url,
      url: threadInfo && threadInfo.permalink_url,
      photos: extractPhotos(threadInfo),
    });

    thread.set("title", (threadInfo && threadInfo.message) || thread.uniqueKey);
    thread.set("additionData", additionData);
    return thread.save();
  };

  reloadCustomer = async (customer) => {
    const customerInfo = await getUserProfileFB(
      customer.uniqueKey,
      this.accessToken
    );
    const {
      name,
      picture: {
        data: { url: avatarUrl },
      },
    } = customerInfo;

    const additionData = _.merge(customer.additionData, { avatarUrl });
    customer.set("name", name);
    customer.set("additionData", additionData);
    return customer.save();
  };

  clearMissMessage = async (message, thread) => {
    const [
      { missCount, missTime },
    ] = await calculateInferenceField.filterMissTwoLevelInThread(thread.id);

    thread.set("missCount", missCount);
    thread.set("missTime", missTime);
    thread.save();
  };

  clearMissThread = async (thread) => {
    await db.ThreadInferenceData.update(
      {
        missCount: 0,
        missTime: null,
      },
      {
        where: { threadId: thread.id },
      }
    );

    thread.set("missCount", 0);
    thread.set("missTime", null);
    await thread.save();
  };
}

export default FBComment;
