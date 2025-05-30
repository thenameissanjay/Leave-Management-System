const {EntitySchema} = require( 'typeorm');

const leave_type_dm = new EntitySchema({
  name: "leave_type_dm",
  tableName: "leave_type_dm",
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

module.exports = { leave_type_dm };