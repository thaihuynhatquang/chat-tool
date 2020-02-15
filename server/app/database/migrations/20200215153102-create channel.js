'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('channels', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        type: {
          allowNull: false,
          type: Sequelize.STRING
        },
        title: {
          allowNull: false,
          type: Sequelize.STRING
        },
        description: {
          allowNull: true,
          type: Sequelize.STRING(1024)
        },
        privacy: {
          allowNull: false,
          defaultValue: 'public',
          type: Sequelize.ENUM('public', 'private')
        },
        configs: {
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
      .then(() => queryInterface.addIndex('channels', ['type']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('channels')
  }
}
