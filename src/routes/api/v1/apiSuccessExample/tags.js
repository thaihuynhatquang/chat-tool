/**
 * @apiDefine GetTagsResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": [
 *         "id": 1,
 *         "content": "Tag",
 *         "color": "#11111",
 *         "createdAt": null,
 *         "updatedAt": "2018-11-02T03:53:42.000Z",
 *         "creator": 1
 *       ]
 *    }
 */

/**
 * @apiDefine GetTagResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "content": "Tag",
 *       "color": "#11111",
 *       "createdAt": null,
 *       "updatedAt": "2018-11-02T03:53:42.000Z",
 *       "creator": 1
 *    }
 */

/**
 * @apiDefine AddTagResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 2,
 *       "content": "Tagggg",
 *       "color": "#111111",
 *       "creator": "1"
 *     }
 */

/**
 * @apiDefine GetTagCustomerResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": [
 *         {
 *           "id": 1,
 *           "channelId": 1,
 *           "uniqueKey": "2243000795773537",
 *           "name": "Nguyễn Văn Việt",
 *           "phone": null,
 *           "additionData": {
 *             "gender": "male",
 *             "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=1024&ext=1543715290&hash=AeRYh5OMUm4BRJFn"
 *           },
 *           "createdAt": "2018-11-02T01:48:10.000Z",
 *           "updatedAt": "2018-11-02T01:48:10.000Z",
 *           "channel_id": 1,
 *           "CustomerTag": {
 *             "creator": 1,
 *             "createdAt": "2018-11-02T03:54:05.000Z",
 *             "customer_id": 1,
 *             "tag_id": 1
 *           }
 *         }
 *       ]
 *    }
 */
