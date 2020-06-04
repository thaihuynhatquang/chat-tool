import {
  ROLE_STAFF,
  ROLE_CHANNEL_OWNER,
  ROLE_MAINTAINER,
} from "constants";
import { flatten } from "utils/common";

const channelIds = [1, 2, 3, 4, 5, 6];
let id = 1;

const roles = [
  {
    name: "Staff",
    key: ROLE_STAFF,
    description: "Nhân viên đảm nhiệm việc nhận và rep tin nhắn trong channel",
    color: "#3498db",
  },
  {
    name: "Channel Owner",
    key: ROLE_CHANNEL_OWNER,
    description:
      "Người quản lý channel, có quyền thay đổi thông tin channel, tạo invitelink mời người vào channel, thay đổi role của user",
    color: "#e74c3c",
  },
  {
    name: "Maintainer",
    key: ROLE_MAINTAINER,
    description:
      "Duy trì toàn bộ hệ thống, có thể đọc tất cả tin nhắn trên mọi channel",
    color: "#546e7a",
  },
];

export const allRoles = flatten(
  channelIds.map((channelId) => {
    return roles.map((role) => ({
      id: id++,
      ...role,
      channel_id: channelId,
    }));
  })
);

export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert("roles", allRoles, {});
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      "roles",
      {
        id: {
          [Op.in]: allRoles.map((role) => role.id),
        },
      },
      {}
    );
  },
};
