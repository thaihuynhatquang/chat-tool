/**
 * @apiDefine GetCustomersResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": {
 *         "id": 1,
 *         "channelId": 1,
 *         "uniqueKey": "2243000795773537",
 *         "name": "Nguyễn Văn Việt",
 *         "phone": null,
 *         "additionData": {
 *           "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=1024&ext=1543715290&hash=AeRYh5OMUm4BRJFn"
 *         },
 *         "createdAt": "2018-11-02T01:48:10.000Z",
 *         "updatedAt": "2018-11-02T01:48:10.000Z",
 *         "channel_id": 1
 *       }
 *     }
 */

/**
 * @apiDefine GetCustomerResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "channelId": 1,
 *       "uniqueKey": "2243000795773537",
 *       "name": "Nguyễn Văn Việt",
 *       "phone": null,
 *       "additionData": {
 *         "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=1024&ext=1543715290&hash=AeRYh5OMUm4BRJFn"
 *       },
 *       "createdAt": "2018-11-02T01:48:10.000Z",
 *       "updatedAt": "2018-11-02T01:48:10.000Z",
 *       "channel_id": 1
 *     }
 */

/**
 * @apiDefine EditCustomerResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "channelId": 1,
 *       "uniqueKey": "2243000795773537",
 *       "name": "Edited",
 *       "phone": 0399747494,
 *       "additionData": {
 *         "avatarUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=1024&ext=1543715290&hash=AeRYh5OMUm4BRJFn"
 *       },
 *       "createdAt": "2018-11-02T01:48:10.000Z",
 *       "updatedAt": "2018-11-02T01:48:10.000Z",
 *       "channel_id": 1
 *     }
 */

/**
 * @apiDefine GetCustomerTagResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": [
 *         {
 *           "id": 1,
 *           "content": "Tag",
 *           "color": "#11111",
 *           "createdAt": null,
 *           "updatedAt": "2018-11-02T03:53:42.000Z",
 *           "creator": 1,
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

/**
 * @apiDefine AddCustomerTagResponse
 * @apiSuccessExample Success-Response:
 *      {
 *         "creator": 1,
 *         "customerId": 2,
 *         "tagId": 2
 *      }
 */

/**
 * @apiDefine GetCustomerNoteResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "count": 1,
 *       "data": [
 *         {
 *           "id": 1,
 *           "content": "Khach hang dep trai",
 *           "createdAt": "2018-11-02T08:34:25.000Z",
 *           "updatedAt": "2018-11-02T08:34:25.000Z",
 *           "customer_id": 1,
 *           "creator": 1
 *         }
 *       ]
 *    }
 */

/**
 * @apiDefine AddCustomerNoteResponse
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 3,
 *       "content": "Notes",
 *       "creator": 1,
 *       "customer_id": 2,
 *       "user": {
 *           "id": 1,
 *           "iamId": 20,
 *           "name": "Nguyễn Văn Việt",
 *           "email": "viet.nv@teko.vn",
 *           "phone": "0399747494",
 *           "dob": null,
 *           "ssoId": "50495",
 *           "avatarUrl": "https://scontent.fhan3-2.fna.fbcdn.net/v/t1.0-9/46518934_340697840074325_4883368147580616704_n.jpg?_nc_cat=107&_nc_ht=scontent.fhan3-2.fna&oh=bbe276ac006a6094485d3b4379622ef0&oe=5C9DDD7F",
 *           "department": "COD",
 *           "position": "Developer",
 *           "createdAt": "2018-11-30T10:00:43.000Z",
 *           "updatedAt": "2018-12-06T02:42:01.000Z"
 *       }
 *     }
 */
