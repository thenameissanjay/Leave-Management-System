const { EntitySchema } = require("typeorm");

const leave_policy = new EntitySchema({
  name: "leave_policy",
  tableName: "leave_policy",
  columns: {
    level: {
      primary: true,
      type: "varchar",
    },
    total_sick: {
      type: "int",
    },
    total_casual: {
      type: "int",
    },
    total_others: {
      type: "int",
    },
  },
});

module.exports = { leave_policy };
