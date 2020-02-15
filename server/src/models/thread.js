'use strict'
module.exports = (sequelize, DataTypes) => {
  const Thread = sequelize.define(
    'Thread',
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
      title: {
        allowNull: false,
        type: DataTypes.STRING
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING
      },
      lastMsgContent: {
        field: 'last_msg_content',
        type: DataTypes.STRING
      },
      missCount: {
        field: 'miss_count',
        type: DataTypes.INTEGER
      },
      missTime: {
        field: 'miss_time',
        type: 'TIMESTAMP'
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
      tableName: 'threads'
    }
  )

  Thread.associate = function(models) {
    models.Thread.belongsTo(models.Channel)
    models.Thread.belongsToMany(models.Customer, {
      through: 'customer_thread'
    })
    models.Thread.belongsToMany(models.User, {
      through: 'thread_user_serving'
    })
    models.Thread.belongsToMany(models.User, {
      through: 'thread_user_history'
    })
  }

  return Thread
}
