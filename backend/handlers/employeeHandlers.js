const { AppDataSource } = require('../connection');
const { leave_request } = require('../entity/leave_requests');
const { convertToCalendarFormat } = require('../utils/calendarFunction');
const employeeRepo = AppDataSource.getRepository('employee');
const { designation } = require('../entity/designation');
const designationRepo = AppDataSource.getRepository(designation);
const logger = require('../logger/logger');

const leaveRepo = AppDataSource.getRepository('leave_policy');
const leaveRequestRepo = AppDataSource.getRepository(leave_request);
const { LeaveStatus } = require('../entity/leave_requests');
const { leave_balance } = require('../entity/leave_balance');
const { leave_type_dm } = require('../entity/leave_type_dm');
const { employee } = require('../entity/employee');
const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);

/** fetch DesignationName="Sick" by DesignationID="1"
 * GET
 * /api/employee/designation-name/${DesignationID}
 */
const getDesignationName = async (req, res) => {
  const designationID = req.params.DesignationID;

  try {
    const data = await designationRepo.find({
      where: { id: designationID },
      select: ['name'],
    });
    res.json(data);
  } catch (err) {
    logger.error(`employeeHandler/getDesignationName: ${err}`);
    res.status(500).json({ message: 'Database query failed' });
  }
};

/** fetch ReportingName="user_manager" by ReportingID="3"
 * GET
 * /api/employee/reporting-manager-name/${ReportingManagerID}
 */
const getReportingManagerName = async (req, res) => {
  const { ReportingManagerID } = req.params;

  try {
    const employee = await employeeRepo.findOne({
      where: { employee_id: ReportingManagerID },
      select: ['name'],
    });

    if (!employee) {
      logger.error(
        `employeeHandler/getReportingManagerName: Employee Not Found`
      );
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ name: employee.name });
  } catch (err) {
    logger.error(`employeeHandler/getReportingManagerName: ${err}`);
    res.status(500).json({ message: 'Database error' });
  }
};

/** Fetchign leave balance, leave taken , Total leave , leave type of employee
   GET
   /api/employee/total-leave/{employeeID}
 */
const getTotalLeave = async (req, res) => {
  try {
    const employeeId = req.params.EmployeeID;

    const leaveBalances = await leaveBalanceRepo.find({
      where: { employee_id: employeeId },
      relations: ['leave_type_dm'],
    });
    const extracted = [];

    for (const item of leaveBalances) {
      extracted.push({
        total_leave: item.total_leave, // 10
        leave_taken: item.leave_taken, // 5
        balance_leave: item.balance_leave, // 5
        leave_type_name: item.leave_type_dm.name, // Sick
      });
    }
    res.json(extracted);
  } catch (error) {
    logger.error(`employeeHandler/getTotalLeave: ${error}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/** Fetching leaveType for UI DropDown in Request form
   GET
   /api/employee/leave-id/{employeeID}
 */
const getLeaveId = async (req, res) => {
  try {
    const employeeId = req.params.EmployeeID;

    const leaveBalances = await leaveBalanceRepo.find({
      where: { employee_id: employeeId },
      relations: ['leave_type_dm'],
    });
    const response = {};

    leaveBalances.forEach((lb) => {
      const { id, name } = lb.leave_type_dm; // in your entity it's many-to-many
      if (id && lb.total_leave != 0) {
        // ignore total_leave = null
        response[`${id}`] = name; // {1:"sick", 2:"casual", 3:"LOP"}
      }
    });
    res.json(response);
  } catch (error) {
    logger.error(`employeeHandler/getLeaveId: ${error}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET
 * /api/employee/team-calendar/${EmployeeID}
 */
const TeamCalendar = async (req, res) => {
  const EmployeeID = req.params.EmployeeID;

  try {
    // Step 1: Get employees reporting to this manager, with designation
    const teamMembers = await employeeRepo.find({
      where: { reporting_to: EmployeeID },
      select: {
        employee_id: true,
        name: true,
      },
      relations: ['designation'],
    });

    // Step 2: Fetch leaves for each team member with status "400" (approved/rejected/pending?)
    const results = [];

    for (const member of teamMembers) {
      const leaves = await leaveRequestRepo.find({
        where: {
          employee: { employee_id: member.employee_id },
          status: '400',
        },
        select: ['request_id', 'from_date', 'to_date', 'leave_type'],
      });

      results.push({
        employee_id: member.employee_id,
        name: member.name,
        designation: member.designation?.name || null,
        leaves: leaves.map((l) => ({
          request_id: l.request_id,
          from_date: l.from_date,
          to_date: l.to_date,
          leaveType: l.leave_type,
        })),
      });
    }

    res.json(results);
  } catch (error) {
    logger.error(`employeeHandler/TeamCalendar: ${error}`);
    return res.status(500).json({message: error.message})
  }
};

module.exports = {
  getReportingManagerName,
  getDesignationName,
  getTotalLeave,
  getLeaveId,
  TeamCalendar,
};
