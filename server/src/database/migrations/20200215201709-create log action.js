'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('log_user_actions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      applyOn: {
        allowNull: false,
        field: 'apply_on',
        type: Sequelize.STRING
      },
      fromEntity: {
        allowNull: false,
        field: 'from_entity',
        type: Sequelize.INTEGER
      },
      verb: {
        allowNull: false,
        type: Sequelize.STRING
      },
      toEntity: {
        allowNull: false,
        field: 'to_entity',
        type: Sequelize.INTEGER
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        field: 'updated_at',
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('log_user_actions')
  }
}
