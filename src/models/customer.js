export default (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    "Customer",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      channelId: {
        allowNull: false,
        field: "channel_id",
        type: DataTypes.INTEGER,
      },
      uniqueKey: {
        allowNull: false,
        field: "unique_key",
        type: DataTypes.STRING,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(1024),
      },
      phone: {
        type: DataTypes.STRING(50),
      },
      additionData: {
        field: "addition_data",
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
      tableName: "customers",
      name: {
        singular: "customer",
        plural: "customers",
      },
    }
  );

  Customer.associate = function(models) {
    models.Customer.hasMany(models.Note);
    models.Customer.belongsToMany(models.Thread, {
      through: "customer_thread",
    });
    models.Customer.belongsToMany(models.Tag, {
      through: "CustomerTag",
    });
    models.Customer.belongsTo(models.Channel);
  };

  Customer.scopes = function(models) {
    models.Customer.addScope("withNotesAndTags", {
      include: [
        {
          model: models.Note,
          include: [models.User],
        },
        models.Tag,
      ],
    });
  };

  return Customer;
};
