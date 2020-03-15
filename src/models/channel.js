'use strict'
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define(
    'Channel',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      uniqueKey: {
        allowNull: false,
        field: 'unique_key',
        unique: true,
        type: DataTypes.STRING
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING
      },
      configs: {
        type: DataTypes.JSON
      },
      additionData: {
        field: 'addition_data',
        type: DataTypes.JSON
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
      tableName: 'channels'
    }
  )

  Channel.associate = function(models) {
    models.Channel.hasMany(models.Thread)
    models.Channel.belongsToMany(models.User, {
      through: 'channel_user'
    })
  }

  return Channel
}
