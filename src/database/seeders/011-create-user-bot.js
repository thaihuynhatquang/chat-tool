import { BOT_USER_IAM_ID } from "constants";
const BOT_USER_NAME = "Chat Bot";
const BOT_USER_EMAIL = "bot@teko.vn";
const BOT_AVATAR_URL = "/images/bot-avatar.png";

export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      "users",
      [
        {
          iam_id: BOT_USER_IAM_ID,
          name: BOT_USER_NAME,
          email: BOT_USER_EMAIL,
          avatar_url: BOT_AVATAR_URL,
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete(
      "users",
      {
        iam_id: BOT_USER_IAM_ID,
      },
      {}
    );
  },
};
