export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("messages", "hidden", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      after: "processed",
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("messages", "hidden");
  },
};
