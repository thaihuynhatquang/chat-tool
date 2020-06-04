import {
  PERMISSION_UPDATE_CHANNEL,
  PERMISSION_CREATE_INVITE_LINK,
  PERMISSION_READ_ALL_THREADS,
  PERMISSION_SEND_MESSAGE,
  PERMISSION_REMOVE_USER_FROM_CHANNEL,
  PERMISSION_UPDATE_USER_ROLE,
  PERMISSION_AUTO_RECEIVE_THREADS,
  PERMISSION_CREATE_TAG,
} from "constants";

const permissions = [
  {
    id: 1,
    name: "Update Channel",
    key: PERMISSION_UPDATE_CHANNEL,
    description: "Cập nhật thông tin cơ bản của channel (config, name,...)",
  },
  {
    id: 2,
    name: "Create Invite Link",
    key: PERMISSION_CREATE_INVITE_LINK,
    description: "Tạo invite link",
  },
  {
    id: 3,
    name: "Read All Threads",
    key: PERMISSION_READ_ALL_THREADS,
    description: "Đọc toàn bộ threads của một channel",
  },
  {
    id: 4,
    name: "Send Message",
    key: PERMISSION_SEND_MESSAGE,
    description: "Gửi tin nhắn",
  },
  {
    id: 5,
    name: "Remove User From Channel",
    key: PERMISSION_REMOVE_USER_FROM_CHANNEL,
    description: "Xóa user khỏi channel",
  },
  {
    id: 6,
    name: "Update User Role",
    key: PERMISSION_UPDATE_USER_ROLE,
    description: "Cập nhật role của user",
  },
  {
    id: 7,
    name: "Auto Receive Threads",
    key: PERMISSION_AUTO_RECEIVE_THREADS,
    description: "Được tự động phân phòng",
  },
  {
    id: 8,
    name: "Create Tag",
    key: PERMISSION_CREATE_TAG,
    description: "Tạo tag trên channel",
  },
];

export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert("permissions", permissions, {});
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      "permissions",
      {
        id: {
          [Op.in]: permissions.map((p) => p.id),
        },
      },
      {}
    );
  },
};
