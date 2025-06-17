const { AppDataSource } = require('../config/connection');
const { LessThanOrEqual, MoreThanOrEqual, In } = require('typeorm');
const logger = require('../logger/logger');

const {
  leave_request,
  LeaveStatus,
  LeaveStatusLabel,
} = require('../entity/leave_requests');

const { leave_level } = require('../entity/leave_level');
const { designation } = require('../entity/designation');
const { approval_flow } = require('../entity/approval_flow');
const leaveLevelRepo = AppDataSource.getRepository(leave_level);
const designationRepo = AppDataSource.getRepository(designation);
const leaveRequestRepo = AppDataSource.getRepository(leave_request);
const approvalFlowRepo = AppDataSource.getRepository(approval_flow);
const { getBalanceLeave } = require('../service/leavebalanceService');

const { leave_balance } = require('../entity/leave_balance');
const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);
const { getReportingManager } = require('../service/leaveRequestService');

const UpperLevel = {
  director: 0,
  manager: 1,
  hr: 2,
  developer: 3,
  intern: 4,
};

const RoleStatus = [
  { role: 'intern', status: LeaveStatus.pending }, // 100
  { role: 'developer', status: LeaveStatus.developer_approved }, // 150
  { role: 'manager', status: LeaveStatus.manager_approved }, // 200
  { role: 'hr', status: LeaveStatus.hr_approved }, //250
  { role: 'director', status: LeaveStatus.approved }, //300
];

/**   create leave request 
   POST /api/leave/request-leave
    req.body = {
  "employee_id": 24,
  "leaveType": "45",
  "fromDate": "2025-06-04",
  "toDate": "2025-06-04",
  "reason": "dsc",
  "leaveCount": 1,
  "designation": 38,
  "requestAt": "2025-06-04T10:39:08.165Z"
}
*/

const requestLeave = async (req, res) => {
  try {
    const {
      leaveCount,
      employee_id,
      designation,
      leaveType,
      fromDate,
      toDate,
      reason,
      requestAt,
    } = req.body;

    // get designation = {id: 37, name: "developer", description: "developer"}
    const desgRow = await designationRepo.findOne({
      where: { id: designation },
    });

    if (!desgRow) {
      logger.error(`leaveHandler/requestLeave: Invalid designation id`);
      return res.status(404).json({ message: 'Invalid designation id' });
    }

    // desgName = "intern"
    const desgName = desgRow.name.toLowerCase().trim();
    // Maximum Approval for "intern" = 3
    const levelFromDesignation = UpperLevel[desgName];
    // Enum Status of "intern" = 100
    const LeaveFlowStatus = RoleStatus.find((l) => l.role === desgName);
    const status = LeaveFlowStatus.status;

    // getting Approval Level based on Leave count = "3"
    const leaveLevel = await leaveLevelRepo.findOne({
      where: {
        start_count: LessThanOrEqual(leaveCount),
        end_count: MoreThanOrEqual(leaveCount),
      },
    });

    if (!leaveLevel) {
      logger.error(
        `leaveHandler/requestLeave: No approval rule configured for this leaveCount`
      );
      return res.status(404).json({
        message: 'No approval rule configured for this leaveCount',
      });
    }

    // min(approval_level, maximum_approval)
    const approval_order = Math.min(
      leaveLevel.approval_order,
      levelFromDesignation
    );

    const approvers = await getReportingManager(employee_id, approval_order);

    const leaveRequest = leaveRequestRepo.create({
      employee_id: employee_id,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason: reason,
      status: status, // 100
      requestedAt: requestAt,
    });
    await leaveRequestRepo.save(leaveRequest);

    approvers.forEach(async (approverId) => {
      const approvalFlow = approvalFlowRepo.create({
        leave_request_id: leaveRequest.request_id,
        approver_id: approverId, // Approvers ID
        approval_status: LeaveStatus.pending, // PENDING
        approval_at: '',
        comments: '',
      });
      await approvalFlowRepo.save(approvalFlow);
    });

    res.json({
      message: `Successfully updated `,
    });
  } catch (err) {
    logger.error(`leaveHandler/requestLeave: ${err}`);
    res.status(500).json({ message: err.message });
  }
};

/**  Fetching Incoming Leave Request 
 // GET http://localhost:8080/api/leave/incoming-leave-request?EmployeeID=${EmployeeID}&role=${role}&offset=${offset}&limit=${limit} 
 */
const incomingLeaveRequest = async (req, res) => {
  const { EmployeeID, role } = req.query;
  const {offset, limit} = req.query;


  try {
    // find designationName by ID
    const desigRecord = await designationRepo.findOneBy({ id: role });

    if (!desigRecord) {
      logger.error(`leaveHandler/reportingLeaveStatus: Designation not found`);
      return res.status(401).json({ message: 'Designation not found' });
    }

    const lowercaseRole = desigRecord.name.toLowerCase(); // "developer"
    // Enum status of "developer" = 150
    const currentIndex = RoleStatus.findIndex(
      (entry) => entry.role === lowercaseRole
    );
    if (currentIndex === 0) {
      return res.status(401).json({ message: 'No Access for Intern Role' });
    }
    // find previous index of ENUM status = 100
    const status_code = RoleStatus[currentIndex - 1].status;

    const result = await approvalFlowRepo.findAndCount({
      where: {
        approver_id: EmployeeID,
        approval_status: '100',
        leave_request: {
          status: status_code.toString(), // checking 1 step down ENUM status
        },
      },
      relations: [
        'leave_request',
        'leave_request.leave_type',
        'leave_request.employee',
        'leave_request.employee.designation',
      ],
      skip: offset, // OFFSET 
      take: limit,  // LIMIT 
    });
    // result = [actual_response, totalRow]


    // Loop through each result and append leave_balance
    for (const item of result[0]) {
      const leaveRequest = item.leave_request;
      const employee_id = leaveRequest.employee_id;
      const leave_type_id = leaveRequest.leave_type.id;

      // Fetch leave balance of leave request
      if (employee_id && leave_type_id) {
        // find leave balance
        const BalanceLeave = await getBalanceLeave(employee_id, leave_type_id);
        // adding to response
        leaveRequest.leave_balance = BalanceLeave;
      } else {
        leaveRequest.leave_balance = null;
      }
    }
    const totalRow = result[1] // total count of rows
    return res.json({result, totalRow });
  } catch (err) {
    logger.error(`leaveHandler/reportingLeaveStatus: ${err}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** Approved or Reject the Leave Request by manager
   * PUT  /api/leave/update-leave-status
   * req.body = {{
  "request_id": 13,
  "approver_id": 23,
  "status": "approved",
  "approvedAt": "2025-06-05T10:25:54.118Z",
  "comments": "",
  role:37
  }}
 */

const updateLeaveStatus = async (req, res) => {
  const { request_id, approver_id, status, comments, role, approvedAt } =
    req.body;
  try {
    // 1. Fetch designation name from role id
    const desgRecord = await designationRepo.findOneBy({ id: role });

    if (!desgRecord) {
      logger.error(`leaveHandler/updateLeaveStatus: Invalid role ID`);
      return res.status(404).json({ message: 'Invalid role ID' });
    }

    const roleName = desgRecord.name.toLowerCase().trim(); // Manager
    const statusEntry = RoleStatus.find((item) => item.role === roleName);
    // manager's ENUM status = 200
    const statusFromRole = statusEntry.status;

    //  Get approval_flow record
    const record = await approvalFlowRepo.findOneBy({
      leave_request_id: request_id,
      approver_id: approver_id,
    });

    // get request record
    const requestRecord = await leaveRequestRepo.findOneBy({
      request_id: request_id,
    });

    if (!record) {
      logger.error(`leaveHandler/updateLeaveStatus:Approval record not found`);
      return res.status(404).json({ message: 'Approval record not found' });
    }

    const checkAllApproved = async (request_id) => {
      const records = await approvalFlowRepo.find({
        where: { leave_request_id: parseInt(request_id) },
      });
      // Return true if none of the statuses are 100 (pending)
      const noPending =
        records.length > 0 &&
        records.every((record) => record.approval_status !== 100);

      return noPending;
    };

    record.comments = comments || null;
    record.approval_at = approvedAt;
    //  Update the approval status
    if (status === 'approved') {
      // updating Approval Flow's status
      record.approval_status = statusFromRole; //200
      // updating Leave Request's status
      requestRecord.status = statusFromRole; // 200

      await leaveRequestRepo.save(requestRecord);
      await approvalFlowRepo.save(record);

      // checking all other approvers having pending
      if (await checkAllApproved(request_id)) {
        requestRecord.status = LeaveStatus.approved; // Final Approved -> 400
        await leaveRequestRepo.save(requestRecord);

        // Update leave_balance record
        const employeeId = requestRecord.employee_id;
        const leaveTypeId = requestRecord.leave_type;

        const leaveBalanceRecord = await leaveBalanceRepo.findOne({
          where: {
            employee_id: employeeId,
            leave_type_id: leaveTypeId,
          },
        });

        if (leaveBalanceRecord) {
          leaveBalanceRecord.leave_taken += 1;
          leaveBalanceRecord.balance_leave -= 1;

          await leaveBalanceRepo.save(leaveBalanceRecord);
        }
      }
    } else if (status === 'rejected') {
      record.approval_status = LeaveStatus.rejected; //  Rejected in Approval Flow
      requestRecord.status = LeaveStatus.rejected; //  Rejected in Leave Request
      await leaveRequestRepo.save(requestRecord);
      await approvalFlowRepo.save(record);
    } else {
      logger.error(`leaveHandler/updateLeaveStatus: Invalid status value`);
      return res.status(400).json({ message: 'Invalid status value' });
    }

    return res
      .status(200)
      .json({ message: 'Leave status updated successfully' });
  } catch (error) {
    logger.error(`leaveHandler/updateLeaveStatus: ${error}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//list out the previous incoming Leave Status
/**
   GET  http://localhost:8080/api/leave/incoming-history/${EmpolyeeID}/offset=${offset}limit=${limit}
*/
const incomingHistory = async (req, res) => {
  const employeeID = req.params.EmployeeID;
  const {offset, limit} = req.query;

  try {
    const approvalFlowRepo = AppDataSource.getRepository('approval_flow');
    // Fetch all approval_flow records where approver_id == employeeID and approval_status != pending (100)
    const approvalRecords = await approvalFlowRepo.findAndCount({
      where: {
        approver_id: employeeID,
        leave_request: {
          status: In(['400', '500']), // either approved or rejected
        },
      },
      relations: [
        'leave_request',
        'leave_request.leave_type',
        'leave_request.employee',
        'leave_request.employee.designation',
      ],
      order: {
        id: 'DESC',
      },
      skip: offset, // OFFSET 
      take: limit,  // LIMIT 
    });


    // ENUM status "100" -> "Pending"
    const result = approvalRecords[0].map((record) => {
      return {
        ...record,
        approval_status_label: LeaveStatusLabel[record.approval_status], // "400" -> "Approved"
        leave_request: {
          ...record.leave_request,
          status_label: LeaveStatusLabel[record.leave_request.status],
        },
      };
    });
    const totalRow = approvalRecords[1];
    
    return res.json({result, totalRow});
  } catch (err) {
    console.log(err)
    logger.error(`leaveHandler/incomingHistory: ${err}`);
    return res
      .status(500)
      .json({ message: 'Failed to fetch leave approval status' });
  }
};

// Employee Leave Status
// GET `http://localhost:8080/api/leave/leave-status/${employeeID}?offset=${offset}&limit=${limit}`
const leaveStatus = async (req, res) => {
  const employeeID = req.params.EmployeeID;
  const {offset, limit} = req.query;

  try {
    // Fetch all approval_flow records where approver_id == employeeID and approval_status != pending (100)
    const leaveRequests = await leaveRequestRepo.findAndCount({
      where: {
        employee: {
          employee_id: employeeID,
        },
      },
      relations: [
        'employee',
        'employee.designation',
        'leave_type',
        'approval_flow',
        'approval_flow.approver',
      ],
      order: {
        request_id: 'DESC',
      },
      skip: offset, // OFFSET 
      take: limit,  // LIMIT 
    });
   
    // check if the role status === request status
    const result = leaveRequests[0].map((record) => {
    const role = record.employee.designation.name.toLowerCase();
    const roleStatus = RoleStatus.find((item) => item.role === role).status;

      return {
        ...record,
        request_status_label: record.status == roleStatus ? "Pending" : LeaveStatusLabel[record.status], // "400" -> "Approved"
        approval_flow: record.approval_flow.map((approval) => ({
          ...approval,
          approval_status_label: LeaveStatusLabel[approval.approval_status],
        })),
      };
    });
    const totalRow = leaveRequests[1];

    return res.json({result, totalRow});
  } catch (err) {
    logger.error(`leaveHandler/leaveStatus: ${err}`);
    return res
      .status(500)
      .json({ message: 'Failed to fetch leave approval status' });
  }
};


/**
 * canceling the Request
 * DELETE `http://localhost:8080/api/leave/cancelLeave/${requestId}`
 */
const cancelLeave = async (req, res) => {
  const requestId = req.params.requestId;
  try {
    const result = await leaveRequestRepo.findOne({
      where: { request_id: requestId },
    });
    const approved = result.status === 400;

    if (approved) {
      const leaveBalance = await leaveBalanceRepo.findOne({
        where: {
          employee_id: result.employee_id,
          leave_type_id: result.leave_type,
        },
      });
      leaveBalance.balance_leave +=1;
      leaveBalance.leave_taken -=1;
      await leaveBalanceRepo.save(leaveBalance);
    }
    // cancel status put in leave request
    result.status = 600  // Cancel Status Code
    await leaveRequestRepo.save(result)

    return res.json({message: 'Cancel the Leave Request'});
  } catch (err) {
    logger.error(`Error: ${err}`)
    res.status(500).json({ message: 'Failed to delete leave request' });
  }
};

module.exports = {
  requestLeave,
  leaveStatus,
  cancelLeave,
  incomingLeaveRequest,
  updateLeaveStatus,
  incomingHistory,
};
