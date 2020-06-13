import { flatten } from "utils/common";
import { allRoles } from "./003-create-roles";

const userIds = [1, 2];

const userRoles = flatten(
  userIds.map((userId) => {
    return allRoles
      .filter((role) => role.id % 3 === 0)
      .map((role) => ({
        user_id: userId,
        role_id: role.id,
      }));
  })
);

export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert("user_role", userRoles, {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete("user_role", null, {});
  },
};
