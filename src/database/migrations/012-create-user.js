export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      iamId: {
        allowNull: false,
        unique: true,
        field: "iam_id",
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING(50),
      },
      dob: {
        type: Sequelize.DATEONLY,
      },
      ssoId: {
        field: "sso_id",
        type: Sequelize.STRING,
      },
      avatarUrl: {
        field: "avatar_url",
        type: Sequelize.TEXT,
      },
      department: {
        type: Sequelize.STRING(20),
      },
      position: {
        type: Sequelize.STRING,
      },
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        field: "updated_at",
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("users");
  },
};
