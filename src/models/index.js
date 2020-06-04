import fs from "fs";
import path from "path";
import Sequelize, { Model } from "sequelize";
import config from "config/sequelize";
import { DEFAULT_ENV } from "constants";

const debug = require("debug")("app:sequelize");
const basename = path.basename(__filename);

const db = {};

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable] || DEFAULT_ENV, config)
  : new Sequelize(config.database, config.username, config.password, config);

sequelize
  .authenticate()
  .then(() => {
    debug("Sequelize database connection has been established successfully");
  })
  .catch((err) => {
    debug("Error when connect to Database server", err);
  });

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].scopes) {
    db[modelName].scopes(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const dbWithType = db;

export default dbWithType;
