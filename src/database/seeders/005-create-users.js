export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          google_id: "104958587103596098847",
          name: "Nhật Quang Thái Huy",
          email: "thaihuynhatquang@gmail.com",
          phone: "0901791410",
          dob: null,
          avatar_url:
            "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=720&ext=1548391184&hash=AeTDp04KvRAd4Wf9",
          department: "COD",
          position: "Lập trình viên",
        },
        {
          id: 2,
          google_id: "104044710748601499395",
          name: "Huy Nhật Quang Thái",
          email: "quang.thn@teko.vn",
          phone: "0901791410",
          dob: null,
          avatar_url:
            "https://lh3.googleusercontent.com/a-/AOh14GizfroTZ3UPiVKZkcfEOS-PWzjVj3bkf5LpUgrm=s96-c",
          department: "COD",
          position: "Lập trình viên",
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      "users",
      {
        id: {
          [Op.in]: [1, 2],
        },
      },
      {}
    );
  },
};
