const { EntitySchema } = require("typeorm");
const { designation } = require("./designation");



    const employee = new EntitySchema({
        name: "employee",
        tableName: "employee",
        columns: {
          employee_id: {
            primary: true,
            type: "int",
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
            },
            level: {
              type: "varchar",
            },
            date_of_joining: {
              type: "varchar",
            },
            sick: {
              type: "varchar",
            },
            casual: {
              type: "varchar",
            },
            others: {
              type: "varchar",
            },
            reporting_to: {
              type: "int",
            },
            password: {
              type: "varchar",
            },
        },
        relations: {
          leavePolicy: {  // employee() -> leave plocyy(level)
            type: "many-to-one", 
            target: "leave_policy",
            joinColumn: {
              name: "level",
              referencedColumnName: "level",
            },
          },
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
