'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('log_actions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      actorId: {
        allowNull: false,
        field: 'actor_id',
        type: Sequelize.INTEGER,
      },
      sourceKey: {
        field: 'source_key',
        type: Sequelize.STRING,
      },
      sourceId: {
        field: 'source_id',
        type: Sequelize.INTEGER,
      },
      action: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      targetKey: {
        field: 'target_key',
        type: Sequelize.STRING,
      },
      fromData: {
        field: 'from_data',
        type: Sequelize.JSON,
      },
      toData: {
        field: 'to_data',
        type: Sequelize.JSON,
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('log_actions');
  },
};
