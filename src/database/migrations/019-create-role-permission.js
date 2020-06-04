export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("role_permission", {
      roleId: {
        allowNull: false,
        field: "role_id",
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      permissionId: {
        allowNull: false,
        field: "permission_id",
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
    return queryInterface.dropTable("role_permission");
  },
};
