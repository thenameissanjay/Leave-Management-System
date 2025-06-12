const { AppDataSource } = require('../connection');
const { designation } = require('../entity/designation');
const { employee } = require('../entity/employee');
const { leave_balance } = require('../entity/leave_balance');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');
const employeeTypeRepo = AppDataSource.getRepository(designation);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm);
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const employeeRepo = AppDataSource.getRepository(employee);
const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);
const logger = require('../logger/logger');

const updateLeaveBalanceByLeavetype = async (newLeaveType) => {
  try {
    console.log(newLeaveType);
    const employees = await employeeRepo.find(); // Get all employees

    for (const emp of employees) {
      console.log(emp.employee_id);
      await leaveBalanceRepo.save({
        employee_id: emp.employee_id,
        leave_type_id: newLeaveType, // the new LeaveType entity
        year: new Date().getFullYear(),
        total_leave: 0,
        leave_taken: 0,
        balance_leave: 0,
      });
    }
  } catch (error) {
    logger.error(`service/leaveBalanceService: ${error}`);
  }
};
const updateLeaveBalanceByEmployee = async (employee) => {
  const { employee_id, designation } = employee;
  try {
    // get leave policy based on employee role
    const policies = await leavePolicyRepo.find({
      where: { employee_type_id: designation },
    });
    /**
  * [
  {
    id: 241,
    employee_type_id: 34,  // intern
    leave_type_id: 42,     // sick
    max_days_per_year: 15,
    accrual_leave: 4
  },
    {
    id: 246,
    employee_type_id: 34,  // intern
    leave_type_id: 43,     // casual
    max_days_per_year: 15,
    accrual_leave: 4
  },
]
 */
    for (const policy of policies) {
      const leaveBalance = leaveBalanceRepo.create({
        employee_id: employee_id,
        leave_type_id: policy.leave_type_id,
        year: new Date().getFullYear(),
        total_leave: policy.accrual_leave,
        leave_taken: 0,
        balance_leave: policy.accrual_leave,
      });
      await leaveBalanceRepo.save(leaveBalance);
    }
  } catch (error) {
    logger.error(`service/updateLeaveBalanceByEmployee: ${error}`);
  }
};

const updateLeaveBalanceByLeavePolicy = async (leavePolicyPayloads) => {
  try {
    leavePolicyPayloads.forEach(async (policy) => {
      const { designation_id, leaves } = policy;
      const employees = await employeeRepo.find({
        where: {
          designation: designation_id,
        },
      });
      leaves.forEach((leave) => {
        const { leave_type_id, value } = leave;

        employees.forEach(async (emp) => {
          const employee_id = emp.employee_id;
          const year = new Date().getFullYear();

          await leaveBalanceRepo
            .createQueryBuilder()
            .update()
            .set({
              total_leave: () => `total_leave + ${value}`,
              balance_leave: () => `balance_leave + ${value}`,
            })
            .where('employee_id  = :employee_id', { employee_id })
            .andWhere('leave_type_id = :leave_type_id', { leave_type_id })
            .andWhere('year = :year', { year })
            .execute();
        });
      });
    });
  } catch (error) {
    logger.error(`service/updateLeaveBalanceByLeavePolicy: ${error}`);
  }
};

const getBalanceLeave = async (employeeId, leave_type_id) => {
  try {

    const leaveBalances = await leaveBalanceRepo.find({
      where: { employee_id: employeeId, leave_type_id: leave_type_id },
      relations: ['leave_type_dm'], 
    });
    return leaveBalances[0].balance_leave;
  } catch (error) {
    logger.error(`service/getBalanceLeave: ${error}`);
  }
};

const getLeaveTypeName = async (leave_type_id) => {
  try {
    const leave_type = await leaveTypeRepo.find({
      where: {
        id: leave_type_id,
      },
    });
    return leave_type[0].name;
  } catch (err) {
    logger.error(`service/getLeaveTypeName: ${err}`);
  }
};
module.exports = {
  updateLeaveBalanceByLeavetype,
  updateLeaveBalanceByEmployee,
  getLeaveTypeName,
  getBalanceLeave,
  updateLeaveBalanceByLeavePolicy,
};
