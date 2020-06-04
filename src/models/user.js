export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      iamId: {
        allowNull: false,
        field: "iam_id",
        type: DataTypes.STRING,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      dob: {
        type: DataTypes.DATEONLY,
      },
      ssoId: {
        field: "sso_id",
        type: DataTypes.STRING,
      },
      avatarUrl: {
        field: "avatar_url",
        type: DataTypes.TEXT,
      },
      department: {
        type: DataTypes.STRING(20),
      },
      position: {
        type: DataTypes.STRING,
      },
      lastLoginAt: {
        field: "last_login_at",
        type: "TIMESTAMPT",
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
      tableName: "users",
      name: {
        singular: "user",
        plural: "users",
      },
    }
  );

  User.associate = function(models) {
    models.User.belongsToMany(models.Channel, {
      through: "ChannelUser",
    });
    models.User.belongsToMany(models.Thread, {
      as: "threadsServing",
      through: "thread_user_serving",
      updatedAt: false,
    });
    models.User.belongsToMany(models.Thread, {
      as: "threadsHistory",
      through: "thread_user_history",
    });
    models.User.belongsToMany(models.Role, {
      through: "user_role",
    });
    models.User.hasMany(models.TransferThread, {
      as: "receiveTransferThreads",
      foreignKey: "toUserId",
    });
    models.User.hasMany(models.QuickReply);
  };

  User.scopes = function(models) {
    models.User.addScope("withRoles", {
      include: [
        {
          model: models.Role,
          include: [models.Permission],
        },
      ],
    });
    models.User.addScope("withReceiveTransferThreads", {
      include: [
        {
          required: false,
          model: models.TransferThread,
          as: "receiveTransferThreads",
          where: { status: null },
          include: [
            models.Thread,
            {
              model: models.User,
              as: "fromUser",
            },
          ],
        },
      ],
    });
  };

  return User;
};
