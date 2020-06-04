export default (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      channelId: {
        allowNull: false,
        field: "channel_id",
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
      color: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "roles",
      name: {
        singular: "role",
        plural: "roles",
      },
    }
  );
  Role.associate = function(models) {
    models.Role.belongsTo(models.Channel);
    models.Role.belongsToMany(models.Permission, {
      through: "role_permission",
    });
    models.Role.belongsToMany(models.User, {
      through: "user_role",
    });
  };

  return Role;
};
