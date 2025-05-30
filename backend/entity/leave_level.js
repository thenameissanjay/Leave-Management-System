const { EntitySchema } = require("typeorm");

    const leave_level = new EntitySchema({
        name: "leave_level",
        tableName: "leave_level",
        columns: {
          leave_level_id: {
            primary: true,
            type: "int",
            nullable: false
          },
          start_count: {
            type: "varchar",
            length: 45,
            nullable: false

          },
          end_count: {
            type: "varchar",
            length: 45,
            nullable: false


          },
          level_no: {
              type: "varchar",
              length: 45,
              nullable: false

            },
            level_1: {
              type: "varchar",
              length: 45,
              nullable: false


            },
            level_2: {
              type: "varchar",
              length: 45,
              nullable: true


            },
            level_3: {
              type: "varchar",
              length: 45,
              nullable: true


            },
            start_date: {
              type: "varchar",
              length: 45,
              nullable: false


            },
            end_date: {
              type: "varchar",
              length: 45,
              nullable: false


            },
         
        },
      });  


module.exports = { leave_level };
