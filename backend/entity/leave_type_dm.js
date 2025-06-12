const { boolean } = require('joi');
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
    yearAccrual:{
      type: Boolean
    },
    monthAccrual:{
      type: Boolean
    },
    deletedAt: {
      type: 'timestamp',
      nullable: true,
      deleteDate: true, // important for soft delete support
    },
  },
});

module.exports = { leave_type_dm };