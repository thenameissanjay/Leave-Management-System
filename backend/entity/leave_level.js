const { EntitySchema } = require('typeorm');

const leave_level = new EntitySchema({
  name: 'leave_level',
  tableName: 'leave_look_up',
  columns: {
    leave_level_id: {
      primary: true,
      type: 'int',
      nullable: false,
      generated: true,
    },
    start_count: {
      type: 'float',
      nullable: false,
    },
    end_count: {
      type: 'float',
      nullable: false,
    },
    approval_order: {
      type: 'int',
      nullable: false,
    },
    deletedAt: {
      type: 'timestamp',
      nullable: true,
      deleteDate: true, // important for soft delete support
    },
  },
});

module.exports = { leave_level };
