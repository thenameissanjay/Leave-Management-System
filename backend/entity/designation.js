const { EntitySchema } = require("typeorm");

    const designation = new EntitySchema({
        name: "designation",
        tableName: "designation",
        columns: {
          id: {
            primary: true,
            type: "int",
            generated: true, 
          },
          name: {
            type: "varchar",
          },
          description: {
            type: "varchar",
          },
        },
      });  


module.exports = { designation };
