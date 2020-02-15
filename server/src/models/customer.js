'use strict'
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    'Customer',
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
      name: {
        allowNull: false,
        type: DataTypes.STRING(1024)
      },
      phone: {
        type: DataTypes.STRING(50)
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
      tableName: 'customers'
    }
  )

  Customer.associate = function(models) {
    models.Customer.belongsToMany(models.Thread, {
      through: 'customer_thread'
    })
    models.Customer.belongsToMany(models.Tag, {
      through: 'customer_tag'
    })
    models.Customer.belongsTo(models.Channel)
  }

  return Customer
}
