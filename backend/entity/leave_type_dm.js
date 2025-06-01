const {EntitySchema} = require( 'typeorm');

const leave_type_dm = new EntitySchema({
  name: "leave_type_dm",
  tableName: "leave_type_dm",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    name: {
      type: "varchar",
    },
    description: {
      type: "varchar",
    },
  },
});

module.exports = { leave_type_dm };