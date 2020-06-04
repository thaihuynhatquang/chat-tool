export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("messages", "content", Sequelize.TEXT);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("messages", "content", Sequelize.STRING);
  },
};
