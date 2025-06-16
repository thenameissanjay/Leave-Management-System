const { leave_balance } = require('../entity/leave_balance');
const { leave_type_dm } = require('../entity/leave_type_dm');
const { employee } = require('../entity/employee');
const { AppDataSource } = require('../config/connection');

const carryForwardLeaveBalance = async () => {
  try {
    const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);
    const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    //  Get all leave types where accrual is true
    const accrualLeaveTypes = await leaveTypeRepo.find({
      where: { yearAccrual: true },
    });

    const accrualLeaveTypeIds = accrualLeaveTypes.map((type) => type.id);

    //  Fetch all leave balances for current year
    const currentBalances = await leaveBalanceRepo.find({
      where: { year: currentYear },
      relations: { employee: true, leave_type_dm: true },
    });

    const newBalances = [];

    for (const balance of currentBalances) {
      const { employee_id, leave_type_id, balance_leave } = balance;

      const isAccrual = accrualLeaveTypeIds.includes(leave_type_id);

      const total_leave = isAccrual ? balance_leave : 0;

      const newEntry = leaveBalanceRepo.create({
        employee_id,
        leave_type_id,
        year: nextYear,
        total_leave,
        leave_taken: 0,
        balance_leave: total_leave,
      });

      newBalances.push(newEntry);
    }
    // return console.log(newBalances);

    //  insert all new leave balances
    await leaveBalanceRepo.save(newBalances);

    return console.log('Update Succesfully')
  } catch (err) {
    return console.error('Error carrying forward leave balances:', err);
  }
};

module.exports = { carryForwardLeaveBalance };
