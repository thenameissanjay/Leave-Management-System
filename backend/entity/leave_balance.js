const {EntitySchema} = require( 'typeorm');
const { designation } = require('./designation');
const { leave_type_dm } = require('./leave_type_dm');
const { employee } = require('./employee');

const leave_balance = new EntitySchema({
  name: "leave_balance",
  tableName: "leave_balance",
  columns: {
    id: {
      type: "int",
      primary: true,
      nullable: false,
      generated: "increment",
    },
    employee_id: {
      type: "int",
    },
    leave_type_id: {
      type: "int",
    },
    year: {
      type: "int",
    },
    total_leave:{
        type: "int",
    },
    leave_taken:{
        type: "int"
    },
    balance_leave:{
        type: 'int'
    },
    deletedAt: {
      type: 'timestamp',
      nullable: true,
      deleteDate: true, // important for soft delete support
    },
  },
  relations:{
    employee: { 
      type: "many-to-one", 
      target: employee,
      joinColumn: {
        name: "employee_id",
        referencedColumnName: "employee_id",
      },
    },
    leave_type_dm:{
      type:'many-to-one',
      target: leave_type_dm,
      joinColumn:{
        name:'leave_type_id',
        referencedColumnName:'id'
      }
    }
  }
});

module.exports = { leave_balance };