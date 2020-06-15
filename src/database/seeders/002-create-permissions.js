import {
  PERMISSION_ADD_USER_TO_CHANNEL,
  PERMISSION_AUTO_RECEIVE_THREADS,
  PERMISSION_CREATE_CHANNEL,
  PERMISSION_CREATE_INVITE_LINK,
  PERMISSION_CREATE_TAG,
  PERMISSION_READ_ALL_THREADS,
  PERMISSION_REMOVE_USER_FROM_CHANNEL,
  PERMISSION_SEND_MESSAGE,
  PERMISSION_UPDATE_CHANNEL,
  PERMISSION_UPDATE_USER_ROLE,
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
    name: "Add User To Channel",
    key: PERMISSION_ADD_USER_TO_CHANNEL,
    description: "Thêm user vào channel",
  },
  {
    id: 6,
    name: "Remove User From Channel",
    key: PERMISSION_REMOVE_USER_FROM_CHANNEL,
    description: "Xóa user khỏi channel",
  },
  {
    id: 7,
    name: "Update User Role",
    key: PERMISSION_UPDATE_USER_ROLE,
    description: "Cập nhật role của user",
  },
  {
    id: 8,
    name: "Auto Receive Threads",
    key: PERMISSION_AUTO_RECEIVE_THREADS,
    description: "Được tự động phân phòng",
  },
  {
    id: 9,
    name: "Create Tag",
    key: PERMISSION_CREATE_TAG,
    description: "Tạo tag trên channel",
  },
  {
    id: 10,
    name: "Create Channel",
    key: PERMISSION_CREATE_CHANNEL,
    description: "Tạo channel mới",
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
