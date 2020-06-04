export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("channel_user", "configs", {
      type: Sequelize.JSON,
      after: "user_id",
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("channel_user", "configs");
  },
};
