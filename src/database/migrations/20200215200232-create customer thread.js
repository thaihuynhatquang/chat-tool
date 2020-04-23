'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('customer_thread', {
      customerId: {
        allowNull: false,
        field: 'customer_id',
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      threadId: {
        allowNull: false,
        field: 'thread_id',
        primaryKey: true,
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
    return queryInterface.dropTable('customer_thread');
  },
};
