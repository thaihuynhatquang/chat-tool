'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING
      },
      dob: {
        type: DataTypes.DATEONLY
      },
      ssoId: {
        field: 'sso_id',
        type: DataTypes.STRING
      },
      avatarUrl: {
        field: 'avatar_url',
        type: DataTypes.TEXT
      },
      department: {
        type: DataTypes.STRING(20)
      },
      position: {
        type: DataTypes.STRING
      },
      cacheExpireAt: {
        field: 'cache_expire_at',
        type: 'TIMESTAMP'
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP'
      },
      updatedAt: {
        field: 'updated_at',
        type: 'TIMESTAMP'
      }
    },
    {
      tableName: 'users'
    }
  )

  User.associate = function(models) {
    models.User.belongsToMany(models.Channel, {
      through: 'channel_user'
    })
    models.User.belongsToMany(models.Thread, {
      as: 'threadsServing',
      through: 'thread_user_serving',
      updatedAt: false
    })
    models.User.belongsToMany(models.Thread, {
      as: 'threadsHistory',
      through: 'thread_user_history'
    })
  }

  return User
}
