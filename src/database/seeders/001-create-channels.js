import { THREAD_ASSIGN_MODE_AUTO, THREAD_ASSIGN_MODE_MANUAL } from "constants";

export default {
  up: (queryInterface, Sequelize) => {
    const doanhNghiepGiauMessageChannel = {
      id: 1,
      type: "messenger",
      unique_key: "111264767117248",
      title: "Doanh nghiệp giàu",
      configs: {
        isBroadcast: false,
        assignMode: THREAD_ASSIGN_MODE_AUTO,
        appId: "914346135669523",
        appSecret: "171756d36b41cabddf926301c82aaa80",
        accessToken:
          "EAAMZCl8yeSxMBAK9WQZALnaK1860ZBuxvUUIxeo4gdQm6JHZA131g6OPRtZAn2qnGqMTUUdkDRRze8pyrJmY5oHOg3ZBh8p1Dna6ZCHdiuOHrJMZAM18wc0ZClYDxP8xEXqt1ApTFs71GmpJL0AUW7UvBYURZBsoadd6ZBcWpDH5ESvsfDvstjPGQyE",
        verifyToken: "thnq",
      },
      addition_data: {
        avatarUrl:
          "https://scontent-hkg3-2.xx.fbcdn.net/v/t1.0-9/p960x960/86380066_115114113398980_4003637134576582656_o.jpg?_nc_cat=110&_nc_sid=85a577&_nc_ohc=Luj5GzPjwn8AX8ax1BY&_nc_ht=scontent-hkg3-2.xx&_nc_tp=6&oh=ad8e4a156e41df7442696bbf853218d2&oe=5E938CFE",
        name: "Doanh nghiệp giàu",
        facebookUrl:
          "https://www.facebook.com/Doanh-Nghi%E1%BB%87p-Gi%C3%A0u-111264767117248/",
      },
    };

    const doanhNghiepGiauFacebookComment = {
      id: 2,
      type: "fbcomment",
      unique_key: "111264767117248",
      title: "Doanh nghiệp giàu",
      configs: {
        isBroadcast: false,
        assignMode: THREAD_ASSIGN_MODE_AUTO,
        appId: "914346135669523",
        appSecret: "171756d36b41cabddf926301c82aaa80",
        accessToken:
          "EAAMZCl8yeSxMBAK9WQZALnaK1860ZBuxvUUIxeo4gdQm6JHZA131g6OPRtZAn2qnGqMTUUdkDRRze8pyrJmY5oHOg3ZBh8p1Dna6ZCHdiuOHrJMZAM18wc0ZClYDxP8xEXqt1ApTFs71GmpJL0AUW7UvBYURZBsoadd6ZBcWpDH5ESvsfDvstjPGQyE",
        verifyToken: "thnq",
      },
      addition_data: {
        avatarUrl:
          "https://scontent-hkg3-2.xx.fbcdn.net/v/t1.0-9/p960x960/86380066_115114113398980_4003637134576582656_o.jpg?_nc_cat=110&_nc_sid=85a577&_nc_ohc=Luj5GzPjwn8AX8ax1BY&_nc_ht=scontent-hkg3-2.xx&_nc_tp=6&oh=ad8e4a156e41df7442696bbf853218d2&oe=5E938CFE",
        name: "Doanh nghiệp giàu",
        facebookUrl:
          "https://www.facebook.com/Doanh-Nghi%E1%BB%87p-Gi%C3%A0u-111264767117248/",
      },
    };

    const sguetConfessionMessageChannel = {
      id: 3,
      type: "messenger",
      unique_key: "1524236341229289",
      title: "SGuet confessions",
      configs: {
        isBroadcast: false,
        assignMode: THREAD_ASSIGN_MODE_AUTO,
        appId: "914346135669523",
        appSecret: "171756d36b41cabddf926301c82aaa80",
        accessToken:
          "EAAMZCl8yeSxMBADMT2BIhZAxLiSF84HFxqlf5LCBy5elmYgERvxxlNjNieXZBZAbdVDqehbGU3aJhKckJZBGFHEfW1IemSRaJ9I836K3ZCBCqZC0tmr8WBPoNZC5uiyPtWZAIRFGTuzH5rumX3ISuEAJutEZA6gZAuoGcHZChHZBIkY8Ox87xWX4GTPKV",
        verifyToken: "thnq",
      },
      addition_data: {
        avatarUrl:
          "https://scontent-hkg4-1.xx.fbcdn.net/v/t31.0-8/p960x960/14708071_1698871510432437_7066549912353019610_o.jpg?_nc_cat=108&_nc_sid=85a577&_nc_ohc=zBXvwyC7a5MAX9zuzEJ&_nc_ht=scontent-hkg4-1.xx&_nc_tp=6&oh=3c2c7bdb80265fe9e5ac410ac149f8cf&oe=5F0A6316",
        name: "SGuet confessions",
        facebookUrl: "https://www.facebook.com/sgcfs/",
      },
    };

    return queryInterface.bulkInsert(
      "channels",
      [
        doanhNghiepGiauMessageChannel,
        doanhNghiepGiauFacebookComment,
        sguetConfessionMessageChannel,
      ],
      {},
      {
        configs: { type: new Sequelize.JSON() },
        addition_data: { type: new Sequelize.JSON() },
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      "channels",
      {
        id: {
          [Op.in]: [1, 2, 3],
        },
      },
      {}
    );
  },
};
