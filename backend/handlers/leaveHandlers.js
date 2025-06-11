const { AppDataSource } = require('../connection');
const { LessThanOrEqual, MoreThanOrEqual, In } = require('typeorm');

const { employee } = require('../entity/employee');
const {
  leave_request,
  LeaveStatus,
  LeaveStatusLabel,
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

const employeeLevel = {
  director: 0,
  manager: 1,
  hr: 2,
  developer: 3,
  intern: 4,
};

const LeaveStatusFlow = [
  { role: 'intern', status: LeaveStatus.pending },
  { role: 'developer', status: LeaveStatus.developer_approved },
  { role: 'manager', status: LeaveStatus.manager_approved },
  { role: 'hr', status: LeaveStatus.hr_approved },
  { role: 'director', status: LeaveStatus.approved },
];

/**   create leave request 
   POST /api/leave/requestLeave
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

    // Validating
    if (
      leaveCount === undefined ||
      Number.isNaN(Number(leaveCount)) ||
      !designation
    ) {
      return res.status(400).json({
        message: 'leaveCount (number) and designation (id) are required',
      });
    }

    // get designation = {id: 37, name: "developer", description: "developer"}
    const desgRow = await designationRepo.findOne({
      where: { id: designation },
    });

    if (!desgRow) {
      return res.status(404).json({ message: 'Invalid designation id' });
    }

    // desgName = "developer"
    const desgName = desgRow.name.toLowerCase().trim();
    // Maximum Approval for "developer" = 3
    const levelFromDesignation = employeeLevel[desgName];
    // Enum Status of "developer" = 150
    const LeaveFlowStatus = LeaveStatusFlow.find((l) => l.role === desgName);
    const status = LeaveFlowStatus.status;

    // getting Approval Level based on Leave count = "3"
    const leaveLevel = await leaveLevelRepo.findOne({
      where: {
        start_count: LessThanOrEqual(leaveCount),
        end_count: MoreThanOrEqual(leaveCount),
      },
    });

    if (!leaveLevel) {
      return res.status(404).json({
        message: 'No approval rule configured for this leaveCount',
      });
    }
    // min(approval_level, maximum_approval)
    const approval_order = Math.min(
      leaveLevel.approval_order,
      levelFromDesignation
    );
    // approver array
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

    const leaveRequest = leaveRequestRepo.create({
      employee_id: employee_id,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason: reason,
      status: status,
      requestedAt: requestAt,
    });
    await leaveRequestRepo.save(leaveRequest);
    console.log(approvers);

    approvers.forEach(async (approverId) => {
      const approvalFlow = approvalFlowRepo.create({
        leave_request_id: leaveRequest.request_id,
        approver_id: approverId,
        approval_status: LeaveStatus.pending,
        approval_at: '',
        comments: '',
      });
      await approvalFlowRepo.save(approvalFlow);
    });

    res.json({
      message: `Successfully updated `,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

/**  Fetching Incoming Leave Request 
 // GET http://localhost:8080/api/leave/reportingLeaveStatus?EmployeeID=${EmployeeID}&role=${role} 
 */
const reportingLeaveStatus = async (req, res) => {
  const { EmployeeID, role } = req.query;

  if (!EmployeeID || !role) {
    return res
      .status(400)
      .json({ message: 'EmployeeID and role are required' });
  }

  try {
    const designationRepo = AppDataSource.getRepository(designation);
    // find designationName by ID
    const desigRecord = await designationRepo.findOneBy({ id: role });

    if (!desigRecord) {
      return res.status(401).json({ message: 'Designation not found' });
    }

    const lowercaseRole = desigRecord.name.toLowerCase(); // "developer"
    // Enum status of "developer" = 150
    const currentIndex = LeaveStatusFlow.findIndex(
      (entry) => entry.role === lowercaseRole
    );
    if (currentIndex === 0) {
      return res.status(401).json({ message: 'No Access for Intern Role' });
    }
    // find previous index of ENUM status = 100
    const status_code = LeaveStatusFlow[currentIndex - 1].status;
    console.log(status_code);
    if (status_code === undefined) {
      return res
        .status(404)
        .json({ message: 'Invalid status mapping for role' });
    }

    const result = await approvalFlowRepo.find({
      where: {
        approver_id: EmployeeID,
        approval_status: '100',
        leave_request: {
          status: status_code.toString(),
        },
      },
      relations: [
        'leave_request',
        'leave_request.leave_type',
        'leave_request.employee',
        'leave_request.employee.designation',
      ],
    });

    // Loop through each result and append leave_balance
    for (const item of result) {
      const leaveRequest = item.leave_request;
      const employee_id = leaveRequest.employee_id;
      const leave_type_id = leaveRequest.leave_type?.id;

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

    return res.json(result);
  } catch (err) {
    console.error('Error fetching approval records:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** Approved or Reject the Leave Request by manager
   * PUT  /api/leave/updateLeaveStatus
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

  if (!request_id || !approver_id || !status || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    // 1. Fetch designation name from role id
    const desgRecord = await designationRepo.findOneBy({ id: role });

    if (!desgRecord) {
      return res.status(404).json({ message: 'Invalid role ID' });
    }

    const roleName = desgRecord.name.toLowerCase().trim(); // Manager
    const statusEntry = LeaveStatusFlow.find((item) => item.role === roleName);
    // manager's ENUM status = 200
    const statusFromRole = statusEntry.status;

    //  Get approval_flow record
    const record = await approvalFlowRepo.findOneBy({
      leave_request_id: parseInt(request_id),
      approver_id: parseInt(approver_id),
    });

    const requestRecord = await leaveRequestRepo.findOneBy({
      request_id: parseInt(request_id),
    });

    if (!record) {
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
      record.approval_status = statusFromRole;
      // updating Leave Request's status
      requestRecord.status = statusFromRole;

      await leaveRequestRepo.save(requestRecord);
      await approvalFlowRepo.save(record);

      // checking all other approvers having pending
      if (await checkAllApproved(request_id)) {
        requestRecord.status = LeaveStatus.approved; // Final Approved
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
        } else {
          console.warn(
            `Leave balance not found for employee_id ${employeeId} and leave_type_id ${leaveTypeId}`
          );
        }
      }
    } else if (status === 'rejected') {
      record.approval_status = LeaveStatus.rejected; //  Rejected in Approval Flow
      requestRecord.status = LeaveStatus.rejected; //  Rejected in Leave Request
      await leaveRequestRepo.save(requestRecord);
      await approvalFlowRepo.save(record);
    } else {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    return res
      .status(200)
      .json({ message: 'Leave status updated successfully' });
  } catch (error) {
    console.error('Error updating approval status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//list out the previous Leave Status
/**
   GET  http://localhost:8080/api/leave/incomingHistory/${EmpolyeeID}
   */
const incomingHistory = async (req, res) => {
  const employeeID = req.params.EmployeeID;
  if (!employeeID) {
    return res.status(400).json({ message: 'EmployeeID is required' });
  }
  try {
    const approvalFlowRepo = AppDataSource.getRepository('approval_flow');

    // Fetch all approval_flow records where approver_id == employeeID and approval_status != pending (100)
    const approvalRecords = await approvalFlowRepo.find({
      where: {
        approver_id: parseInt(employeeID),
        leave_request: {
          status: In(['400', '500']),
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
    });

    // ENUM status "100" -> "Pending"
    const result = approvalRecords.map((record) => {
      return {
        ...record,
        approval_status_label: LeaveStatusLabel[record.approval_status],
        leave_request: {
          ...record.leave_request,
          status_label: LeaveStatusLabel[record.leave_request.status],
        },
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Error fetching leave status:', err);
    return res
      .status(500)
      .json({ error: 'Failed to fetch leave approval status' });
  }
};

// Employee Leave Status
// GET `http://localhost:8080/api/leave/leaveStatus/${employeeID}`
const leaveStatus = async (req, res) => {
  const employeeID = req.params.EmployeeID;
  if (!employeeID) {
    return res.status(400).json({ message: 'EmployeeID is required' });
  }
  try {
    // Fetch all approval_flow records where approver_id == employeeID and approval_status != pending (100)
    const leaveRequests = await leaveRequestRepo.find({
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
    });

    return res.json(leaveRequests);
  } catch (err) {
    console.error('Error fetching leave status:', err);
    return res
      .status(500)
      .json({ error: 'Failed to fetch leave approval status' });
  }
};



const cancelLeave = async (req, res) => {
  const requestId = req.params.requestId;
  if (!requestId) {
    return res.json({ message: 'required name and description' });
  }

  try {
    // Step 1: Fetch all leave entries for the request_id
    const leaveRequests = await AppDataSource.getRepository(leave_request).find(
      {
        where: { request_id: requestId },
      }
    );

    if (leaveRequests.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const allApproved = leaveRequests.every(
      (request) => request.status === LeaveStatus.approved
    ); // 200 === status[approved]
    const { employee_id, leave_type } = leaveRequests[0]; // all rows have same employee_id and leave_type

    // Step 2: Delete the leave request
    await AppDataSource.getRepository(leave_request).delete({
      request_id: requestId,
    });

    // Step 3: If all were approved, decrement the leave count
    if (allApproved) {
      const employeeRepo = AppDataSource.getRepository(employee);
      const employee = await employeeRepo.findOne({ where: { employee_id } });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Decrement leave balance
      const leaveTypeColumn = leave_type.toLowerCase();
      if (employee[leaveTypeColumn] > 0) {
        employee[leaveTypeColumn] -= 1;
        await employeeRepo.save(employee);

        return res.status(200).json({
          success: true,
          message: 'Leave request deleted and leave balance updated',
        });
      } else {
        return res.status(400).json({ error: 'Leave balance is already zero' });
      }
    } else {
      // Skip decrementing leave count
      return res.status(200).json({
        success: true,
        message: 'Leave request deleted (no leave balance updated)',
      });
    }
  } catch (err) {
    console.error('TypeORM error:', err);
    res.status(500).json({ error: 'Failed to delete leave request' });
  }
};

module.exports = {
  requestLeave,
  leaveStatus,
  cancelLeave,
  reportingLeaveStatus,
  updateLeaveStatus,
  incomingHistory,
};
