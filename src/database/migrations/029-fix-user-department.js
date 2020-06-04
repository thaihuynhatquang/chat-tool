"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("users", "department", {
      type: Sequelize.STRING(200),
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("users", "department", {
      type: Sequelize.STRING(20),
    });
  },
};
