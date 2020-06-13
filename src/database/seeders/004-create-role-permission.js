import { flatten } from "utils/common";
import { allRoles } from "./003-create-roles";

const rolePers = flatten(
  allRoles.map((role) => {
    let permissionIds = [];
    switch (role.id % 3) {
      case 1:
        permissionIds = [4, 7];
        break;
      case 2:
        permissionIds = [1, 2, 3, 4, 5, 6, 8];
        break;
      case 0:
        permissionIds = [1, 2, 3, 4, 5, 6, 9];
        break;
      default:
        break;
    }

    return permissionIds.map((pId) => ({
      role_id: role.id,
      permission_id: pId,
    }));
  })
);

export default {
  up: (queryInterface) => {
    return queryInterface.bulkInsert("role_permission", rolePers, {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete("role_permission", null, {});
  },
};
