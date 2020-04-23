'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      mid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      threadId: {
        allowNull: false,
        primaryKey: true,
        field: 'thread_id',
        type: DataTypes.INTEGER,
      },
      customerId: {
        allowNull: false,
        field: 'customer_id',
        type: DataTypes.INTEGER,
      },
      isVerified: {
        field: 'is_verified',
        type: DataTypes.BOOLEAN,
      },
      userId: {
        field: 'user_id',
        type: DataTypes.INTEGER,
      },
      parentId: {
        field: 'parent_id',
        type: DataTypes.STRING,
      },
      processed: {
        type: DataTypes.BOOLEAN,
      },
      content: {
        type: DataTypes.STRING,
      },
      additionData: {
        field: 'addition_data',
        type: DataTypes.JSON,
      },
      msgCreatedAt: {
        field: 'msg_created_at',
        type: 'TIMESTAMP',
      },
      msgUpdatedAt: {
        field: 'msg_updated_at',
        type: 'TIMESTAMP',
      },
      msgDeletedAt: {
        field: 'msg_deleted_at',
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'messages',
      timestamps: false,
    },
  );

  return Message;
};
