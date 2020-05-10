'use strict';
module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define(
    'Note',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      content: {
        allowNull: false,
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
      tableName: 'notes',
      name: {
        singular: 'note',
        plural: 'notes',
      },
    },
  );

  Note.associate = function(models) {
    models.Note.belongsTo(models.Customer);
    models.Note.belongsTo(models.User, {
      foreignKey: 'creator',
    });
  };

  return Note;
};
