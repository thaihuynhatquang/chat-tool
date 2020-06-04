export default (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      key: {
        unique: true,
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
      },
      updatedAt: {
        field: "updated_at",
        type: "TIMESTAMP",
      },
    },
    {
      tableName: "permissions",
      name: {
        singular: "permission",
        plural: "permissions",
      },
    }
  );
  Permission.associate = function(models) {
    models.Permission.belongsToMany(models.Role, {
      through: "role_permission",
    });
  };
  return Permission;
};
