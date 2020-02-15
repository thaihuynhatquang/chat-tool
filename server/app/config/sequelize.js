require("dotenv").config();

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  host: process.env.DB_HOST,
  dialect: "mysql",
  migrationStorageTableName: "sequelize_migrations",
  seederStorageTableName: "sequelize_seeders"
};
