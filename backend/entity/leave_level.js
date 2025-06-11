const { EntitySchema } = require("typeorm");

    const leave_level = new EntitySchema({
        name: "leave_level",
        tableName: "leave_look_up",
        columns: {
          leave_level_id: {
            primary: true,
            type: "int",
            nullable: false,
            generated: true
          },
          start_count: {
            type: "int",
            nullable: false

          },
          end_count: {
            type: "int",
            nullable: false

          },
          approval_order: {
              type: "int",
              nullable: false

            },
            
         
        },
      });  


module.exports = { leave_level };
