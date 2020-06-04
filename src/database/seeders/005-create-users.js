export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          iam_id: "abcdefgh",
          name: "Nguyễn Văn Việt",
          email: "viet.nv@teko.vn",
          phone: "0399747494",
          dob: null,
          sso_id: "50495",
          avatar_url:
            "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2243000795773537&width=720&ext=1548391184&hash=AeTDp04KvRAd4Wf9",
          department: "COD",
          position: "Developer",
        },
        {
          id: 2,
          iam_id: "abcdefghik",
          name: "Lê Hải Nam",
          email: "nam.lh@teko.vn",
          phone: "0383978805",
          dob: null,
          sso_id: 50162,
          avatar_url:
            "https://orig00.deviantart.net/2391/f/2014/007/5/3/mirai_kuriyama__gif__by_lightning441-d71amdw.gif",
          department: "COD",
          position: "Lập trình viên",
        },
        {
          id: 3,
          iam_id: "abcdefghiklmn",
          name: "Vũ Minh Tuấn",
          email: "Tuan.vm@teko.vn",
          phone: "0965278274",
          dob: null,
          sso_id: 50229,
          avatar_url:
            "https://scontent.fhan2-3.fna.fbcdn.net/v/t1.0-9/39186605_258667034753943_6231410261257879552_n.jpg?_nc_cat=108&_nc_ht=scontent.fhan2-3.fna&oh=2811f406e3af04b05290ac461ef158ba&oe=5C940C5F",
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
          [Op.in]: [1, 2, 3],
        },
      },
      {}
    );
  },
};
