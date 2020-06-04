export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "last_login_at", {
      type: "TIMESTAMP",
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      after: "position",
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("users", "last_login_at");
  },
};
