import axios from 'axios';
import { GRAPH_FB_URL } from 'constants';

export const getCommentAttachmentData = async (commentId, accessToken) => {
  return axios
    .get(`${GRAPH_FB_URL}/${commentId}?fields=attachment&access_token=${accessToken}`)
    .then((res) => res.data);
};

export const getUserProfileFB = (userId, accessToken) => {
  return axios
    .get(`${GRAPH_FB_URL}/${userId}?fields=name,picture.width(720)&access_token=${accessToken}`)
    .then((res) => res.data);
};

export const getPostInformation = (fbPostId, accessToken) => {
  return axios(`${GRAPH_FB_URL}/${fbPostId}`, {
    params: {
      fields: 'attachments,message,created_time,type,source,link,updated_time,from,permalink_url',
      access_token: accessToken,
    },
  }).then((res) => res.data);
};

export const sendMessenger = (formData, accessToken) => {
  return axios
    .post(`${GRAPH_FB_URL}/me/messages?access_token=${accessToken}`, formData, {
      headers: formData.getHeaders(),
    })
    .then((res) => {
      return { success: true, response: res.data };
    })
    .catch((err) => {
      return {
        success: false,
        response: err.response ? err.response.data.error : err,
      };
    });
};

export const postComment = (formData, target, accessToken) => {
  return axios
    .post(`${GRAPH_FB_URL}/${target}/comments?access_token=${accessToken}`, formData, {
      headers: formData.getHeaders(),
    })
    .then((res) => {
      return { success: true, response: res.data };
    })
    .catch((err) => {
      return {
        success: false,
        response: err.response ? err.response.data.error : err,
      };
    });
};
