export default {
  up: (queryInterface) => {
    return queryInterface.addColumn("threads", "last_msg_at", {
      type: "TIMESTAMP",
      allowNull: true,
      defaultValue: null,
      after: "last_msg_id",
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("threads", "last_msg_at");
  },
};
