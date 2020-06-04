export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_role", {
      userId: {
        allowNull: false,
        field: "user_id",
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      roleId: {
        allowNull: false,
        field: "role_id",
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        field: "created_at",
        allowNull: false,
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("user_role");
  },
};
