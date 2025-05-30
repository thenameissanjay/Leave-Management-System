const { EntitySchema } = require("typeorm");

 const LeaveStatus = {
  pending :0,
  approved :200,
  rejected : 400,
}

const LeaveStatusLabel = {
  [LeaveStatus.pending]: 'pending',
  [LeaveStatus.approved]: 'approved',
  [LeaveStatus.rejected]: 'rejected',
};

    const leave_request = new EntitySchema({
        name: "leave_requests",
        tableName: "leave_requests",
        columns: {
          id: {
            type: "int",
            primary: true,
            generated: true, // Auto-incremented surrogate key
          },
          request_id: {
            type: "int",
            nullable:false
          },
          employee_id: {  // many
            type: "int",
            nullable:false
          },
          leave_type: {
            type: "varchar",
            length: 45
          },
          from_date: {
              type: "datetime",
            },
            to_date: {
              type: "datetime",
            },
            reason: {
              type: "varchar",
              length: 100
            },
            status: {
              type: "enum",
              enum: LeaveStatus,         // Use the enum
              default: LeaveStatus.pending,
            },
            reporting_to: {
              type: "varchar",
              length: 45
          }, 
        },
        relations: {
          employee: {
            type: "many-to-one",
            target: "employee", 
            joinColumn: {
              name: "employee_id", // foreign key 
              referencedColumnName: "employee_id", // primary key 
            },
          },
        },
      });  


module.exports = { leave_request, LeaveStatus, LeaveStatusLabel };
