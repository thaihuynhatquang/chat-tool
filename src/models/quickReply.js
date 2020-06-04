export default (sequelize, DataTypes) => {
  const QuickReply = sequelize.define(
    "QuickReply",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        field: "user_id",
        type: DataTypes.INTEGER,
      },
      content: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      createdAt: {
        field: "created_at",
        type: "TIMESTAMP",
      },
      updatedAt: {
        field: "updated_at",
        type: "TIMESTAMP",
      },
    },
    {
      tableName: "quick_replies",
      name: {
        singular: "quickReply",
        plural: "quickReplies",
      },
    }
  );

  QuickReply.associate = function(models) {
    models.QuickReply.belongsTo(models.User);
  };

  return QuickReply;
};
