export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("notes", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        customerId: {
          allowNull: false,
          field: "customer_id",
          type: Sequelize.INTEGER,
        },
        creator: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        content: {
          allowNull: false,
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
      })
      .then(() =>
        queryInterface.addIndex("notes", {
          fields: ["customer_id"],
        })
      );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("notes");
  },
};
