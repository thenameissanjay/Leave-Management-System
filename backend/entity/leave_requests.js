const { EntitySchema } = require("typeorm");

 const LeaveStatus = {
  pending :100,
  developer_approved: 150,
  manager_approved : 200,
  hr_approved : 250,
  director_approved :300,
  approved: 400,
  rejected: 500,
  cancelled: 600
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
          request_id: {
            type: "int",
            primary: true,
            generated: true, // Auto-incremented surrogate key
          },
          employee_id: {  // many
            type: "int",
          },
          leave_type: {
            type: "int",

          },
          from_date: {
              type: "date",

            },
            to_date: {
              type: "date",

            },
            reason: {
              type: "varchar",
              length: 100,

            },
            status: {
              type: "enum",
              enum: LeaveStatus,         // Use the enum
              default: LeaveStatus.pending,
            },
            requestedAt:{
              type:"datetime",

            }
         
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
          leave_type: {
            type: "many-to-one",
            target: "leave_type_dm", 
            joinColumn: {
              name: "leave_type", // foreign key 
              referencedColumnName: "id", // primary key 
            },
          },
          approval_flow: {
            type: "one-to-many",
            target: "approval_flow",
            inverseSide: "leave_request", // match the name in approval_flow relation
          },
        },
      });  


module.exports = { leave_request, LeaveStatus, LeaveStatusLabel };
