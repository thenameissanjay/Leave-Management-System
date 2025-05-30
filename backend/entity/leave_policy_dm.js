const {EntitySchema} = require( 'typeorm');

const leave_policy_dm = new EntitySchema({
  name: "leave_policy_dm",
  tableName: "leave_policy_dm",
  columns: {
    id: {
      primary: true,
      type: "int",
    },
    employee_type_id: {
      type: "int",
    },
    leave_type_id: {
      type: "int",
    },
    max_days_per_year: {
      type: "int",
    },
  },
});

module.exports = { leave_policy_dm };