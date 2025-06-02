require("reflect-metadata");
const { DataSource } = require("typeorm");
const { employee } = require("./entity/employee");
const { designation } = require("./entity/designation");
const { leave_policy } = require("./entity/leave_policy");
const { leave_level } = require("./entity/leave_level");
const { leave_request } = require("./entity/leave_requests");
const { leave_policy_dm } = require("./entity/leave_policy_dm");
const { leave_type_dm } = require("./entity/leave_type_dm");
const { leave_balance } = require("./entity/leave_balance");

require('dotenv').config();

const AppDataSource = new DataSource({
  type: process.env.DBTYPE,
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DBNAME,
  synchronize: true,
  logging: false,
  entities: [employee, designation, leave_policy, leave_level, leave_request, leave_policy_dm, leave_type_dm, leave_balance]
});

module.exports = { AppDataSource };
