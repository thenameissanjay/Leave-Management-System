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
          deletedAt: {
            type: 'timestamp',
            nullable: true,
            deleteDate: true, // important for soft delete support
          },
        },
      });  


module.exports = { designation };
