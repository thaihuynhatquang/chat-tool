'use strict';
module.exports = (sequelize, DataTypes) => {
  const ThreadInferenceData = sequelize.define(
    'ThreadInferenceData',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      threadId: {
        allowNull: false,
        field: 'thread_id',
        type: DataTypes.INTEGER,
      },
      uniqueKey: {
        allowNull: false,
        field: 'unique_key',
        unique: true,
        type: DataTypes.STRING,
      },
      missCount: {
        field: 'miss_count',
        type: DataTypes.INTEGER,
      },
      missTime: {
        field: 'miss_time',
        type: 'TIMESTAMP',
      },
      lastMsgId: {
        field: 'last_msg_id',
        type: DataTypes.STRING,
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
      tableName: 'thread_inference_data',
    },
  );

  return ThreadInferenceData;
};
