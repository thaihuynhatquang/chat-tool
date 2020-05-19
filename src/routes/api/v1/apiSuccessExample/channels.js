/**
 * @apiDefine GetChannelsResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": [
 *         {
 *           "id": 1,
 *           "uniqueKey": "1948539038572011",
 *           "type": "messenger",
 *           "title": "Soleil VN Facebook Fanpage",
 *           "configs": {
 *             "isBroadcast": true,
 *             "appId": "eyJhbGciOiJIUzI1NiJ9.MTczMTc2NjYwMjg4OTk1.PJaygFfNotIhRiBpd0yZB7W_IsvDm58qdZO_4k7lWRw",
 *             "appSecret": "eyJhbGciOiJIUzI1NiJ9.YTlkMDMzZmQxNDdmYWNmMjA3ODg2MTNlMDMxZTZlNTc.auBdtftOHi99m9f3NlzI7AMxOEnvu_kkDANdF6xnwnM",
 *             "accessToken": "eyJhbGciOiJIUzI1NiJ9.RUFBQ2RnTlZSNWVNQkFOUkhwVkVqOEVpdmE0bjZFaTJQekVQN0t3Z2xnQ01FVVQwdmo4N2IxRlBRR0ZzQlVTVkE0WG5wd08xald6bnVnZW9QbFlEMFI1blNGaWkybXJJRWRjVmRoT1NPakxyWkNLb243OVc0dzhNdUJaQlRWdWJXVW1FTnVQWHBDWkJMWVpCdDNXTUJkbjJKOXlDbGhJMGJaQjloNVpBUjlJTnZnc1FrdEZCVTJU.hEX4t0rV8Yifd11JyfaYVdHLEe0ckwX_5Fj9RopiR-A",
 *             "verifyToken": "eyJhbGciOiJIUzI1NiJ9.U29sZWls.zvbZ2-iiNHRyDfzqCmE_wI0h6OnLStGiP9IEtAeEZ-w"
 *           },
 *           "additionData": {
 *             "name": "Soleil VN",
 *             "avatarUrl": "https://scontent.fsgn2-3.fna.fbcdn.net/v/t1.0-9/44124470_1948539105238671_9092799310159937536_n.png?_nc_cat=106&_nc_ht=scontent.fsgn2-3.fna&oh=472175034e9d2c97e436b4856a4c3791&oe=5C425B72",
 *             "facebookUrl": "https://www.facebook.com/Soleil-VN-1948539038572011/"
 *           },
 *           "createdAt": "2018-11-02T01:39:47.000Z",
 *           "updatedAt": "2018-11-02T01:39:47.000Z",
 *           "missCount": 1
 *         }
 *       ]
 *     }
 */

/**
 * @apiDefine GetChannelResponse
 * @apiSuccessExample Success-Response:
 *   {
 *      "id": 1,
 *      "uniqueKey": "1948539038572011",
 *      "type": "messenger",
 *      "title": "Soleil VN Facebook Fanpage",
 *      "configs": {
 *         "isBroadcast": true,
 *         "appId": "eyJhbGciOiJIUzI1NiJ9.MTczMTc2NjYwMjg4OTk1.PJaygFfNotIhRiBpd0yZB7W_IsvDm58qdZO_4k7lWRw",
 *         "appSecret": "eyJhbGciOiJIUzI1NiJ9.YTlkMDMzZmQxNDdmYWNmMjA3ODg2MTNlMDMxZTZlNTc.auBdtftOHi99m9f3NlzI7AMxOEnvu_kkDANdF6xnwnM",
 *         "accessToken": "eyJhbGciOiJIUzI1NiJ9.RUFBQ2RnTlZSNWVNQkFOUkhwVkVqOEVpdmE0bjZFaTJQekVQN0t3Z2xnQ01FVVQwdmo4N2IxRlBRR0ZzQlVTVkE0WG5wd08xald6bnVnZW9QbFlEMFI1blNGaWkybXJJRWRjVmRoT1NPakxyWkNLb243OVc0dzhNdUJaQlRWdWJXVW1FTnVQWHBDWkJMWVpCdDNXTUJkbjJKOXlDbGhJMGJaQjloNVpBUjlJTnZnc1FrdEZCVTJU.hEX4t0rV8Yifd11JyfaYVdHLEe0ckwX_5Fj9RopiR-A",
 *         "verifyToken": "eyJhbGciOiJIUzI1NiJ9.U29sZWls.zvbZ2-iiNHRyDfzqCmE_wI0h6OnLStGiP9IEtAeEZ-w"
 *      },
 *      "additionData": {
 *         "name": "Soleil VN",
 *         "avatarUrl": "https://scontent.fsgn2-3.fna.fbcdn.net/v/t1.0-9/44124470_1948539105238671_9092799310159937536_n.png?_nc_cat=106&_nc_ht=scontent.fsgn2-3.fna&oh=472175034e9d2c97e436b4856a4c3791&oe=5C425B72",
 *         "facebookUrl": "https://www.facebook.com/Soleil-VN-1948539038572011/"
 *      },
 *      "createdAt": "2018-11-02T01:39:47.000Z",
 *      "updatedAt": "2018-11-02T01:39:47.000Z",
 *      "missCount": 1
 *   }
 */

/**
 * @apiDefine GetChannelUserResponse
 * @apiSuccessExample Success-Response:
 *   {
 *     "count": 1,
 *     "data": [
 *       {
 *         "id": 1,
 *         "iamId": 20,
 *         "name": "Nguyễn Văn Việt",
 *         "email": "viet.nv@teko.vn",
 *         "phone": "0399747494",
 *         "dob": null,
 *         "ssoId": "50495",
 *         "avatarUrl": "https://scontent.fhan3-2.fna.fbcdn.net/v/t1.0-9/46518934_340697840074325_4883368147580616704_n.jpg?_nc_cat=107&_nc_ht=scontent.fhan3-2.fna&oh=bbe276ac006a6094485d3b4379622ef0&oe=5C9DDD7F",
 *         "department": "COD",
 *         "position": "Developer",
 *         "createdAt": "2018-11-30T10:00:43.000Z",
 *         "updatedAt": "2018-12-06T02:42:01.000Z",
 *         "channel_user": {
 *           "channel_id": 1,
 *           "user_id": 1
 *         }
 *       }
 *     ]
 *   }
 */

/**
 * @apiDefine AddChannelUserResponse
 * @apiSuccessExample Success-Response:
 *    {
 *       "channelId": 5,
 *       "userId": 1
 *    }
 */

/**
 * @apiDefine GetChannelThreadsResponse
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
 *             "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=1024&ext=1543715290&hash=AeRYh5OMUm4BRJFn"
 *           },
 *           "createdAt": "2018-11-02T01:48:10.000Z",
 *           "updatedAt": "2018-11-02T01:48:10.000Z",
 *           "channel_id": 1
 *           "lastMessage": {
 *               "mid": "DgQZqKT3Sh3z-jew43aBEvmi20LgTFzFxyMB5WJxTgLFaAI5SoCElqu0entomAVkCacAM2-B7RBV-s625XBdaQ",
 *               "threadId": 3,
 *               "customerId": 2,
 *               "isVerified": false,
 *               "content": "Demo content",
 *               "userId": 1,
 *               "additionData": null,
 *               "msgCreatedAt": "2018-11-21 09:17:48",
 *               "msgUpdatedAt": "2018-11-21 09:17:48",
 *               "customer": {
 *                 "id": 2,
 *                 "channelId": 1,
 *                 "uniqueKey": "2243000795773537",
 *                 "name": "Nguyễn Văn Việt",
 *                 "phone": "0399747494",
 *                 "additionData": {
 *                 "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=720&ext=1544841073&hash=AeQJC7nBZwxw7kUp"
 *                 },
 *                 "createdAt": "2018-11-15T02:31:13.000Z",
 *                 "updatedAt": "2018-11-23T02:46:42.000Z"
 *               },
 *               "user": {
 *                 "id": 1,
 *                 "iamId": 20,
 *                 "name": "Nguyễn Văn Việt",
 *                 "email": "viet.nv@teko.vn",
 *                 "phone": "0399747494",
 *                 "dob": null,
 *                 "ssoId": "50495",
 *                 "avatarUrl": "https://scontent.fhan3-2.fna.fbcdn.net/v/t1.0-9/46518934_340697840074325_4883368147580616704_n.jpg?_nc_cat=107&_nc_ht=scontent.fhan3-2.fna&oh=bbe276ac006a6094485d3b4379622ef0&oe=5C9DDD7F",
 *                 "department": "COD",
 *                 "position": "Developer",
 *                 "createdAt": "2018-11-30T10:00:43.000Z",
 *                 "updatedAt": "2018-12-06T02:42:01.000Z"
 *               }
 *            }
 *         }
 *       ],
 *       nextCursor: "ajksdfhaklsdfurajksdfhlkasdfierqkweqklwehieyui"
 *     }
 */
