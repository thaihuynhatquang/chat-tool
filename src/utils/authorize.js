import db from "models";

export const checkUserPermission = async (userId, permissionKey, channelId) => {
  const permission = await db.Permission.findOne({
    where: { key: permissionKey },
  });
  if (!permission) return false;
  const user = await db.User.findByPk(userId);
  if (!user) return [];
  const [rolesOfUser, rolesOfPermission] = await Promise.all([
    user.getRoles({
      where: { channelId },
    }),
    permission.getRoles({
      where: { channelId },
    }),
  ]);

  const roleIdsOfPermission = rolesOfPermission.map((item) => item.id);
  return (
    rolesOfUser.filter((role) => roleIdsOfPermission.indexOf(role.id) !== -1)
      .length !== 0
  );
};

export const getUsersByPermission = async (permissionKey, channelId) => {
  const permission = await db.Permission.findOne({
    where: { key: permissionKey },
  });
  if (!permission) return [];

  const rolesOfPermission = await permission.getRoles({
    where: { channelId },
  });

  const usersHasPermission = await db.User.findAll({
    include: [
      {
        model: db.Role,
        where: {
          id: rolesOfPermission.map((role) => role.id),
          channel_id: channelId,
        },
      },
    ],
  });

  return usersHasPermission;
};
