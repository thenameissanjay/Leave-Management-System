const {EntitySchema} = require( 'typeorm');
const { designation } = require('./designation');
const { leave_type_dm } = require('./leave_type_dm');

const leave_policy_dm = new EntitySchema({
  name: "leave_policy_dm",
  tableName: "leave_policy_dm",
  columns: {
    id: {
      type: "int",
      primary: true,
      nullable: false,
      generated: "increment",
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
    accrual_leave:{
      type: "int",
    },
    deletedAt: {
      type: 'timestamp',
      nullable: true,
      deleteDate: true, // important for soft delete support
    },
  },
  relations:{
    designation: { 
      type: "many-to-one", 
      target: "designation",
      joinColumn: {
        name: "employee_type_id",
        referencedColumnName: "id",
      },
    },
    leave_type:{
      type:'many-to-one',
      target: leave_type_dm,
      joinColumn:{
        name:'leave_type_id',
        referencedColumnName:'id'
      }
    }
  }
});

module.exports = { leave_policy_dm };