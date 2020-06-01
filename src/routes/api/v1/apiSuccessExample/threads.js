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

/**
 * @apiDefine GetAttachmentsResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 7,
 *       "data": [
 *         {
 *           "mid": "NfnD6yeLGBbFfJxR9scvtfmi20LgTFzFxyMB5WJxTgK7gJBxNSrW_XXI-Gh5Bd47kEmjb8q2qZWz5odc4zjWbw",
 *           "additionData": {
 *             "attachments": [
 *               {
 *                 "type": "image",
 *                 "payload": {
 *                   "url": "https://scontent.xx.fbcdn.net/v/t1.15752-9/48404092_2067079363371629_7966536225177731072_n.jpg?_nc_cat=109&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=9610263aceb7898b291bdbe9a83d1218&oe=5C8EC805"
 *                 }
 *               },
 *               {
 *                 "type": "image",
 *                 "payload": {
 *                   "url": "https://scontent.xx.fbcdn.net/v/t1.15752-9/48403094_475426602861943_4535136266554966016_n.jpg?_nc_cat=102&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=761ae300046a64470194a25d9b32ffd9&oe=5C94275F"
 *                 }
 *               }
 *             ]
 *           },
 *           "msgCreatedAt": "2018-12-20T06:51:34.000Z"
 *         }
 *      ],
 *       "nextCursor": "eyJtc2dDcmVhdGVkQXQiOiIyMDE4LTEyLTIwVDA2OjUxOjM0LjAwMFoiLCJtaWQiOiJOZm5ENnllTEdCYkZmSnhSOXNjdnRmbWkyMExnVEZ6Rnh5TUI1V0p4VGdLN2dKQnhOU3JXX1hYSS1HaDVCZDQ3a0VtamI4cTJxWld6NW9kYzR6aldidyJ9"
 *     }
 */
