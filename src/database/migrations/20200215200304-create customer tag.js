'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('customer_tag', {
      customerId: {
        allowNull: false,
        field: 'customer_id',
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tagId: {
        allowNull: false,
        field: 'tag_id',
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      creator: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('customer_tag');
  },
};
