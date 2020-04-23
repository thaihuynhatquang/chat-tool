'use strict';
module.exports = (sequelize, DataTypes) => {
  const CustomerTag = sequelize.define(
    'CustomerTag',
    {
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP',
      },
    },
    {
      tableName: 'customer_tag',
    },
  );

  return CustomerTag;
};
