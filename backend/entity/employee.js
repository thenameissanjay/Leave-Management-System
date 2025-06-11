const { EntitySchema, PrimaryColumnCannotBeNullableError } = require("typeorm");
const { designation } = require("./designation");

    const employee = new EntitySchema({
        name: "employee",
        tableName: "employee",
        columns: {
          employee_id: {
            primary: true,
            type: "int",
            generated: true
          },
          name: {
            type: "varchar",
          },
          email: {
            type: "varchar",
          },
          phone: {
              type: "bigint",
            },
            designation: {
              type: "int",
              nullable: true

            },
            date_of_joining: {
              type: "date",
              nullable: true
            },
            reporting_to: {
              type: "int",
              nullable: true
            },
            password: {
              type: "varchar",
            },
        },
        relations: {
          designation:{
            type: "many-to-one",
            target: designation,
            joinColumn:{
              name: "designation",
              referencedColumnName: "id"
            }
          }
        }
      });  


module.exports = { employee };
