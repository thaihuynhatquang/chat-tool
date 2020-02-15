'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('threads', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        channelId: {
          allowNull: false,
          field: 'channel_id',
          type: Sequelize.INTEGER
        },
        uniqueKey: {
          allowNull: false,
          field: 'unique_key',
          type: Sequelize.STRING
        },
        status: {
          allowNull: false,
          type: Sequelize.STRING
        },
        additionData: {
          field: 'addition_data',
          type: Sequelize.JSON
        },
        createdAt: {
          field: 'created_at',
          type: Sequelize.INTEGER
        },
        updatedAt: {
          field: 'updated_at',
          type: Sequelize.INTEGER
        }
      })
      .then(() => queryInterface.addIndex('threads', ['channel_id']))
      .then(() =>
        queryInterface.addIndex('threads', {
          fields: ['unique_key'],
          unique: true
        })
      )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('threads')
  }
}
