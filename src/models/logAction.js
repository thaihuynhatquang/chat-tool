'use strict'
module.exports = (sequelize, DataTypes) => {
  const LogAction = sequelize.define(
    'LogRequest',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      actorId: {
        allowNull: false,
        field: 'actor_id',
        type: DataTypes.INTEGER
      },
      sourceKey: {
        field: 'source_key',
        type: DataTypes.STRING
      },
      sourceId: {
        field: 'source_id',
        type: DataTypes.INTEGER
      },
      action: {
        allowNull: false,
        type: DataTypes.STRING
      },
      targetKey: {
        field: 'target_key',
        type: DataTypes.STRING
      },
      fromData: {
        field: 'from_data',
        type: DataTypes.JSON
      },
      toData: {
        field: 'to_data',
        type: DataTypes.JSON
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP'
      }
    },
    {
      tableName: 'log_actions'
    }
  )

  return LogAction
}
