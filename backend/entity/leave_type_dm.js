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
    yearAccrual:{       // Casual - True
      type: Boolean
    },
    monthAccrual:{     // floater - False
      type: Boolean
    },
    deletedAt: {
      type: 'timestamp',
      nullable: true,
      deleteDate: true, // For typeorm 
    },
  },
});

module.exports = { leave_type_dm };