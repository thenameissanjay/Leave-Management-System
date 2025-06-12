const { AppDataSource } = require('../connection');
const { LessThanOrEqual, MoreThanOrEqual, In } = require('typeorm');
const logger = require('../logger/logger');

const { employee } = require('../entity/employee');
const {
  leave_request,

} = require('../entity/leave_requests');

const { leave_level } = require('../entity/leave_level');
const { designation } = require('../entity/designation');
const { approval_flow } = require('../entity/approval_flow');
const leaveLevelRepo = AppDataSource.getRepository(leave_level);
const employeeRepo = AppDataSource.getRepository(employee);
const designationRepo = AppDataSource.getRepository(designation);
const leaveRequestRepo = AppDataSource.getRepository(leave_request);
const approvalFlowRepo = AppDataSource.getRepository(approval_flow);
const {
  getLeaveTypeName,
  getBalanceLeave,
} = require('../service/leavebalanceService');
const { leave_balance } = require('../entity/leave_balance');
const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);


const getReportingManager = async( employee_id, approval_order) =>{
try {
    const approvers = [];
    let current = employee_id;

    for (let step = 0; step < approval_order; step++) {
      const emp = await employeeRepo.findOne({
        where: { employee_id: current }, // employee_id, name, phone, reporting_to, dateofjoining
        select: ['reporting_to'],
      });

      if (!emp || !emp.reporting_to) break;

      current = emp.reporting_to; // change currect => employee.Reporting_to
      approvers.push(current); // pushing reporting_to
    }
    return approvers;

} catch (error) {
    console.log(error)
}
}

module.exports = {getReportingManager}