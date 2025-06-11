const { EntitySchema } = require("typeorm");
const { leave_level } = require("./leave_level");
const { designation } = require("./designation");
const { leave_request } = require("./leave_requests");
const {LeaveStatus} = require('../entity/leave_requests')
    const approval_flow = new EntitySchema({
        name: "approval_flow",
        tableName: "approval_flow",
        columns: {
            id: {
            primary: true,
            type: "int",
            nullable: false,
            generated: true
          },
          leave_request_id: {
            type: "int",
          },
          approver_id: {
            type: "int",

          },
          approval_status: {
            type: "enum",
            enum: LeaveStatus,      
            default: LeaveStatus.pending,
          },
          approval_at: {
            type: "datetime",
            nullable:true
          },
          comments: {
            type: "varchar",
            nullable:true

          },
        },
        relations: {
          leave_request: {
            type: "many-to-one",
            target: "leave_requests", 
            joinColumn: {
              name: "leave_request_id", // foreign key 
              referencedColumnName: "request_id", // primary key 
            },
          },
          approver: {
            type: "many-to-one",
            target: "employee", 
            joinColumn: {
              name: "approver_id", // foreign key 
              referencedColumnName: "employee_id", // primary key 
            },
          },
        }
        }
      );  


module.exports = { approval_flow };
