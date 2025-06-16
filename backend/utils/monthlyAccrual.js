const { AppDataSource } = require('../config/connection');
const { leave_balance } = require('../entity/leave_balance');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { employee } = require('../entity/employee');

const MonthlyAccrual = async () => {
  try {
    const leaveRepo = AppDataSource.getRepository(leave_balance);
    const policyRepo = AppDataSource.getRepository(leave_policy_dm);
    const employeeRepo = AppDataSource.getRepository(employee);

    const balances = await leaveRepo.find({
      where: {
        leave_type_dm: {
          monthAccrual: true,
        },
      },
      relations: ['leave_type_dm'],
    });

    for (const lb of balances) {
      const emp = await employeeRepo.findOne({
        where: { employee_id: lb.employee_id },
        relations: ['designation'],
      });
      const policy = await policyRepo.findOne({
        where: {
          employee_type_id: emp.designation.id,
          leave_type_id: lb.leave_type_id,
        },
      });

      if (policy) {
        if (lb.total_leave + policy.accrual_leave <= policy.max_days_per_year) {
          lb.total_leave += policy.accrual_leave;
          lb.balance_leave += policy.accrual_leave;

          await leaveRepo.save(lb);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = { MonthlyAccrual };
