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
        appId: "579120855973917",
        appSecret: "bbda68df38dd3652fd23bd52fd7c1080",
        accessToken:
          "EAAIOtRTnAB0BALACQGTElFQtNebK6ZAwPkHNj6yziXXGay54AC6MZBzIZAZBIZAZB5R3Iz4Gfo1VC9wnA3ZAnZCvOHmhm1VTwad8kZAYZC64Rvi5KopBUYMBU9eBW0SAaulrPhHuzVdyE3bhCBVZCHGHMdOr9qEkf2Jw9sxWTljeiZBSeYU5tbjLkmXZC",
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

    const doanhNghiepGiauFBCommentChannel = {
      id: 5,
      type: "fbcomment",
      unique_key: "111264767117248",
      title: "Doanh nghiệp giàu",
      configs: {
        isBroadcast: true,
        assignMode: THREAD_ASSIGN_MODE_MANUAL,
        appId: "579120855973917",
        appSecret: "bbda68df38dd3652fd23bd52fd7c1080",
        accessToken:
          "EAAIOtRTnAB0BALACQGTElFQtNebK6ZAwPkHNj6yziXXGay54AC6MZBzIZAZBIZAZB5R3Iz4Gfo1VC9wnA3ZAnZCvOHmhm1VTwad8kZAYZC64Rvi5KopBUYMBU9eBW0SAaulrPhHuzVdyE3bhCBVZCHGHMdOr9qEkf2Jw9sxWTljeiZBSeYU5tbjLkmXZC",
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

    return queryInterface.bulkInsert(
      "channels",
      [doanhNghiepGiauMessageChannel, doanhNghiepGiauFBCommentChannel],
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
          [Op.in]: [1, 5],
        },
      },
      {}
    );
  },
};
