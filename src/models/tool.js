export default (sequelize, DataTypes) => {
  const tool = sequelize.define(
    "Tool",
    {
      endpoint: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      uniqueKey: {
        allowNull: false,
        field: "unique_key",
        type: DataTypes.STRING,
        primaryKey: true,
      },
      configs: {
        allowNull: false,
        type: DataTypes.JSON,
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
      tableName: "tools",
      name: {
        singular: "tool",
        plural: "tools",
      },
    }
  );
  return tool;
};
