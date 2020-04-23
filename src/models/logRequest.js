'use strict';
module.exports = (sequelize, DataTypes) => {
  const LogRequest = sequelize.define(
    'LogRequest',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      path: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      method: {
        allowNull: false,
        type: DataTypes.STRING(20),
      },
      params: {
        type: DataTypes.JSON,
      },
      body: {
        type: DataTypes.JSON,
      },
      elapsedTime: {
        field: 'elapsed_time',
        type: DataTypes.INTEGER,
      },
      responseStatus: {
        field: 'response_status',
        type: DataTypes.INTEGER,
      },
      createdAt: {
        field: 'created_at',
        type: 'TIMESTAMP',
      },
      updatedAt: {
        field: 'updated_at',
        type: 'TIMESTAMP',
      },
    },
    {
      tableName: 'log_requests',
    },
  );

  return LogRequest;
};
