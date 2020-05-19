/**
 * @apiDefine GetThreadResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "channelId": 1,
 *       "uniqueKey": "2243000795773537",
 *       "title": "Nguyễn Văn Việt",
 *       "status": "unread",
 *       "lastMsgId": "WyYGgmRrcie13CcnJsElnPmi20LgTFzFxyMB5WJxTgJcP-if1udAxmjMr7eyfcmstIHkWVAM_b5EsMPynC98Cg",
 *       "missCount": null,
 *       "missTime": null,
 *       "additionData": null,
 *       "createdAt": "2018-11-02T01:48:10.000Z",
 *       "updatedAt": "2018-11-02T03:45:06.000Z",
 *       "channel_id": 1,
 *       "lastMessage": {
 *         "mid": "WyYGgmRrcie13CcnJsElnPmi20LgTFzFxyMB5WJxTgJcP-if1udAxmjMr7eyfcmstIHkWVAM_b5EsMPynC98Cg",
 *         "threadId": 1,
 *         "customerId": 1,
 *         "isVerified": 0,
 *         "userId": null,
 *         "parentId": null,
 *         "content": "aaaaaaaaaaaaaa",
 *         "additionData": null,
 *         "msgCreatedAt": "2018-11-02T03:45:03.000Z",
 *         "msgUpdatedAt": "2018-11-02T03:45:03.000Z",
 *         "msgDeletedAt": null,
 *         "customer": {
 *           "id": 1,
 *           "channelId": 1,
 *           "uniqueKey": "2243000795773537",
 *           "name": "Nguyễn Văn Việt",
 *           "phone": null,
 *           "additionData": {
 *             "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=1024&ext=1543715290&hash=AeRYh5OMUm4BRJFn"
 *           },
 *           "createdAt": "2018-11-02T01:48:10.000Z",
 *           "updatedAt": "2018-11-02T01:48:10.000Z",
 *           "channel_id": 1
 *         }
 *       }
 *     }
 */

/**
 * @apiDefine GetThreadUserServingResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": [
 *         {
 *           "id": 1,
 *           "name": "Nguyen Van Viet",
 *           "email": "viet.nv@teko.vn",
 *           "phone": "01699747494",
 *           "dob": null,
 *           "ssoId": null,
 *           "avatarUrl": null,
 *           "department": "COD",
 *           "position": "Developer",
 *           "cacheExpireAt": null,
 *           "createdAt": "2018-11-02T09:37:50.000Z",
 *           "updatedAt": "2018-11-02T09:37:50.000Z"
 *         }
 *       ]
 *     }
 */

/**
 * @apiDefine GetThreadMessagesResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": {
 *         "mid": "6fBr1h21dvz0BwTgtEPZffmi20LgTFzFxyMB5WJxTgKcSbCgohBWYVMu04f2XQcFBGtPfxk1KW9Lg8Temoq52A",
 *         "threadId": 1,
 *         "customerId": 1,
 *         "isVerified": 0,
 *         "userId": null,
 *         "parentId": null,
 *         "content": "Day la tin nhan test",
 *         "additionData": null,
 *         "msgCreatedAt": "2018-11-02T01:46:10.000Z",
 *         "msgUpdatedAt": "2018-11-02T01:46:10.000Z",
 *         "msgDeletedAt": null,
 *         "customer": {
 *           "id": 1,
 *           "channelId": 1,
 *           "uniqueKey": "2243000795773537",
 *           "name": "Nguyễn Văn Việt",
 *           "phone": null,
 *           "additionData": {
 *             "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=1024&ext=1543715290&hash=AeRYh5OMUm4BRJFn"
 *           },
 *           "createdAt": "2018-11-02T01:48:10.000Z",
 *           "updatedAt": "2018-11-02T01:48:10.000Z",
 *           "channel_id": 1
 *         }
 *       },
 *       nextCursor: "asdhaisfghsdfghdkajskduqiwyjkashfsdgfahjkdfh"
 *     }
 */

/**
 * @apiDefine SendMessagesResponse
 * @apiSuccessExample Success-Response:
 *    {
 *       "success": true,
 *       "response": {
 *           "recipient_id": "2243000795773537",
 *           "message_id": "m_cm5okJ_tdFUC4mIgJJ48dvmi20LgTFzFxyMB5WJxTgJ6vLEXB7xaxUtQ6AnhAqqGxyIcCTQpvyPJ2-vf8kNqVA"
 *       }
 *    }
 */
