import { TOOL_REVIEW_KEY } from "constants";
import { SALE_REVIEW_QUESTIONS } from "utils/review/questions";

export default {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      "tools",
      [
        {
          unique_key: TOOL_REVIEW_KEY,
          endpoint: "http://chattool-local.teko.vn",
          configs: {
            usage: {
              1: SALE_REVIEW_QUESTIONS,
            },
            reviewExpire: 2592000, // 1 month
          },
        },
      ],
      {},
      { configs: { type: new Sequelize.JSON() } }
    ),

  down: (queryInterface) =>
    queryInterface.bulkDelete("tools", { unique_key: TOOL_REVIEW_KEY }),
};
