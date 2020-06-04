import "@babel/polyfill";
import db from "models";
import { PERMISSION_READ_HIDDEN_MESSAGES, ROLE_STAFF } from "constants";

const permission = {
  id: 9,
  name: "Read Hidden Messages",
  key: PERMISSION_READ_HIDDEN_MESSAGES,
  description:
    "Đọc được các tin nhắn ẩn (tin nhắn review nhân viên, tin nhắn review chatbot)",
};

export default {
  up: async (queryInterface) => {
    const roles = await db.Role.findAll({
      where: { key: { $ne: ROLE_STAFF }, channelId: 1 },
    });
    const rolePermission = roles.map((role) => ({
      role_id: role.id,
      permission_id: permission.id,
    }));
    return Promise.all([
      queryInterface.bulkInsert("permissions", [permission]),
      queryInterface.bulkInsert("role_permission", rolePermission),
    ]);
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.bulkDelete("permissions", { id: permission.id }),
      queryInterface.bulkDelete("role_permission", {
        permission_id: permission.id,
      }),
    ]);
  },
};
