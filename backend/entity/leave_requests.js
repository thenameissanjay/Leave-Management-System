const { EntitySchema } = require('typeorm');

const LeaveStatus = {
  pending: 100,
  developer_approved: 150,
  manager_approved: 200,
  hr_approved: 250,
  director_approved: 300,
  approved: 400,
  rejected: 500,
  cancelled: 600,
};
const dayTypeStatus = {
  fullDay: 100,
  firstHalf: 200,
  secondHalf: 300,
};
const dayTypeStatusLabel = {
  [dayTypeStatus.fullDay]: 'Full Day',
  [dayTypeStatus.firstHalf]: 'First Half',
  [dayTypeStatus.secondHalf]: 'Second Half',
};

const LeaveStatusLabel = {
  [LeaveStatus.pending]: 'Pending',
  [LeaveStatus.developer_approved]: 'Developer approved',
  [LeaveStatus.manager_approved]: 'Manager approved',
  [LeaveStatus.hr_approved]: 'HR approved',
  [LeaveStatus.director_approved]: 'Director approved',
  [LeaveStatus.approved]: 'Approved',
  [LeaveStatus.rejected]: 'Rejected',
  [LeaveStatus.cancelled]: 'Cancelled',
};

const leave_request = new EntitySchema({
  name: 'leave_requests',
  tableName: 'leave_requests',
  columns: {
    request_id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    employee_id: {
      type: 'int',
    },
    leave_type:{
      type: 'int'
    },
    day_type: {
      type: 'enum',
      enum: dayTypeStatus,
      default: dayTypeStatus.fullDay,
    },
    leave_count: {
      type: 'float',
      default: 1,
    },
    from_date: {
      type: 'date',
    },
    to_date: {
      type: 'date',
    },
    reason: {
      type: 'varchar',
      length: 100,
    },
    status: {
      type: 'enum',
      enum: LeaveStatus, // Use the enum
      default: LeaveStatus.pending,
    },

    requestedAt: {
      type: 'datetime',
    },
    deletedAt: {
      type: 'timestamp',
      nullable: true,
      deleteDate: true, // important for soft delete support
    },
  },
  relations: {
    employee: {
      type: 'many-to-one',
      target: 'employee',
      joinColumn: {
        name: 'employee_id', // foreign key
        referencedColumnName: 'employee_id', // primary key
      },
    },
    leave_type: {
      type: 'many-to-one',
      target: 'leave_type_dm',
      joinColumn: {
        name: 'leave_type', // foreign key
        referencedColumnName: 'id', // primary key
      },
    },
    approval_flow: {
      type: 'one-to-many',
      target: 'approval_flow',
      inverseSide: 'leave_request', // match the name in approval_flow relation
    },
  },
});

module.exports = {
  leave_request,
  LeaveStatus,
  LeaveStatusLabel,
  dayTypeStatus,
  dayTypeStatusLabel,
};
