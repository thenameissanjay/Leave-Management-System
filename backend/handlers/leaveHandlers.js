const {AppDataSource} = require('../connection')
const {employee} = require('../entity/employee')
const {leave_request, LeaveStatus, LeaveStatusLabel} = require('../entity/leave_requests')
const {leave_policy} = require('../entity/leave_policy')

const requestLeave = async (req, res) => {


  const employeeRepo = AppDataSource.getRepository(employee);
  const leaveRepo = AppDataSource.getRepository(leave_request);

  const {
    employeeId,
    leaveType,
    fromDate,
    toDate,
    reason,
    reportingManagers,
  } = req.body;

  if (
    !employeeId ||
    !leaveType ||
    !fromDate ||
    !toDate ||
    !reason ||
    reportingManagers.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid data format or missing fields" });
  }

  try {
    const leaveRepo = AppDataSource.getRepository(leave_request);

    // Get max request_id
    const result = await leaveRepo
      .createQueryBuilder("leave")
      .select("MAX(leave.request_id)", "max")
      .getRawOne();
    const requestId = (result.max || 0) + 1;

    const leaveRequests = reportingManagers.map((managerId) =>
      leaveRepo.create({
        request_id: requestId,
        employee_id: employeeId,
        leave_type: leaveType,
        from_date: new Date(fromDate),
        to_date: new Date(toDate),
        reason: reason,
        reporting_to: managerId,
        status: LeaveStatus.pending,
      })
    );

    await leaveRepo.save(leaveRequests);

    res.json({ status: true, requestId });
  } catch (err) {
    console.error("TypeORM error:", err);
    res.status(500).json({ error: "Failed to submit leave request" });
  }
  }
  
  //list out the previous Leave Status
const leaveStatus = async (req, res) => {
    const employeeID = req.params.employeeID;
    if(!employeeID){
      return res.json({message: 'required name and description'})
    }  
    try {
      const leaveRepo = AppDataSource.getRepository(leave_request);
  
      // Fetch all leave requests for the given employee ID, ordered by request_id in descending order
      const leaveRequests = await leaveRepo.find({
        where: { employee_id: employeeID },
        order: { request_id: "DESC" },
      });

      const leaveRequest = leaveRequests.map((request) => {
       const status = request.status;
       return  {
        ...request,
        status: LeaveStatusLabel[status],
      }});

      return res.json(leaveRequest);
    } catch (err) {
      console.error("TypeORM error:", err);
      res.status(500).json({ error: "Failed to fetch leave status" });
    }
  }

const cancelLeave = async (req, res) => {
    const requestId = req.params.requestId;
    if(!requestId){
      return res.json({message: 'required name and description'})
    }

    try {
      // Step 1: Fetch all leave entries for the request_id
      const leaveRequests = await AppDataSource.getRepository(leave_request).find({
        where: { request_id: requestId },
      });
  
      if (leaveRequests.length === 0) {
        return res.status(404).json({ error: "Leave request not found" });
      }
  
      const allApproved = leaveRequests.every((request) => request.status === LeaveStatus.approved);// 200 === status[approved]
      const { employee_id, leave_type } = leaveRequests[0]; // all rows have same employee_id and leave_type
  
      // Step 2: Delete the leave request
      await AppDataSource.getRepository(leave_request).delete({ request_id: requestId });
  
      // Step 3: If all were approved, decrement the leave count
      if (allApproved) {
        const employeeRepo = AppDataSource.getRepository(employee);
        const employee = await employeeRepo.findOne({ where: { employee_id } });
  
        if (!employee) {
          return res.status(404).json({ error: "Employee not found" });
        }
  
        // Decrement leave balance
        const leaveTypeColumn = leave_type.toLowerCase();
        if (employee[leaveTypeColumn] > 0) {
          employee[leaveTypeColumn] -= 1;
          await employeeRepo.save(employee);
  
          return res.status(200).json({
            success: true,
            message: "Leave request deleted and leave balance updated",
          });
        } else {
          return res.status(400).json({ error: "Leave balance is already zero" });
        }
      } else {
        // Skip decrementing leave count
        return res.status(200).json({
          success: true,
          message: "Leave request deleted (no leave balance updated)",
        });
      }
    } catch (err) {
      console.error("TypeORM error:", err);
      res.status(500).json({ error: "Failed to delete leave request" });
    }
  };
  
  // incomign LEaveStatus
const reportingLeaveStatus = async (req, res) => {
    const reportingID = req.params.reportingID;
    if(!reportingID){
      return res.json({message: 'required name and description'})
    }
    
    try {
      // Step 1: Get all request_ids where this manager is one of the approvers
      const leaveRequests = await AppDataSource.getRepository(leave_request)
        .createQueryBuilder("lr")
        .select("DISTINCT lr.request_id")
        .where("lr.reporting_to = :reportingID", { reportingID })
        .orderBy("lr.request_id", "DESC")
        .getRawMany();
  
      if (leaveRequests.length === 0) {
        return res.json([]); // No requests found for this manager
      }
  
      const requestIds = leaveRequests.map((row) => row.request_id);
  
      // Step 2: Fetch leave requests with JOINs to employee and leave_policy
      const allRequests = await AppDataSource.getRepository(leave_request)
        .createQueryBuilder("lr")
        .leftJoinAndSelect("lr.employee", "e")
        .leftJoinAndSelect("e.leavePolicy", "lp")
        .where("lr.request_id IN (:...requestIds)", { requestIds })
        .orderBy("lr.request_id", "DESC")
        .getMany();
        
      // Step 3: Group by request_id
      const grouped = {};
  
      for (const row of allRequests) {
        if (!grouped[row.request_id]) {
          grouped[row.request_id] = {
            request_id: row.request_id,
            employee_id: row.employee_id,
            leave_type: row.leave_type,
            from_date: row.from_date,
            to_date: row.to_date,
            reason: row.reason,
            taken_sick: row.employee.sick,
            taken_casual: row.employee.casual,
            taken_others: row.employee.others,
            total_sick: row.employee.leavePolicy.total_sick,
            total_casual: row.employee.leavePolicy.total_casual,
            total_others: row.employee.leavePolicy.total_others,
            remaining_sick: row.employee.leavePolicy.total_sick - row.employee.sick,
            remaining_casual: row.employee.leavePolicy.total_casual - row.employee.casual,
            remaining_others: row.employee.leavePolicy.total_others - row.employee.others,
            level: row.employee.level,
            approvals: [],
          };
        }
  
        grouped[row.request_id].approvals.push({
          reporting_to: row.reporting_to,
          status: LeaveStatusLabel[row.status],// status[200]
        });
      }
  
      // Step 4: Send final grouped data
      const result = Object.values(grouped);
      return res.json(result);
    } catch (err) {
      console.error("TypeORM error:", err);
      return res.status(500).json({ error: "Failed to fetch leave request details" });
    }
  };
  
const updateLeaveStatus = async (req, res) => {
    const { request_id, manager_id, status } = req.body;
    console.log('hello',status);
    if(!request_id || !manager_id || !status){
      return res.json({message: 'required name and description'})
    }
     
    try {
      // Step 1: Update the leave request status for the given request_id and manager_id
      const leaveRequest = await AppDataSource.getRepository(leave_request)
        .createQueryBuilder()
        .update(leave_request)
        .set({ status: `${LeaveStatus[status]}` })  // status.status
        .where("request_id = :request_id AND reporting_to = :manager_id", { request_id, manager_id })
        .execute();
  
      if (leaveRequest.affected === 0) {
        return res.status(404).json({ error: "Leave request not found or incorrect manager" });
      }
  
      // Step 2: Check all statuses for this request_id
      const leaveRequests = await AppDataSource.getRepository(leave_request)
        .createQueryBuilder("lr")
        .select("lr.status", "status")
        .addSelect("lr.employee_id", "employee_id")
        .addSelect("lr.leave_type", "leave_type")
        .where("lr.request_id = :request_id", { request_id })
        .getRawMany();
  
      if (leaveRequests.length === 0) {
        return res.status(404).json({ error: "No leave requests found for this request_id" });
      }
  
      const statuses = leaveRequests.map(row => LeaveStatusLabel[row.status]); // status[200]
      const employeeId = leaveRequests[0].employee_id;
      const leaveType = leaveRequests[0].leave_type;
  
      if (!employeeId || !leaveType) {
        return res.status(400).json({ error: "Invalid request: Employee or leave type not found" });
      }
  
      // Step 3: If any status is still pending, do nothing
      if (statuses.includes("pending")) {
        return res.status(200).send("Leave status updated successfully (still pending approvals)");
      }
  
      // Step 4: If any status is rejected, do nothing
      if (statuses.includes("rejected")) {
        return res.status(200).send("Leave status updated successfully (request rejected)");
      }
  
      console.log('emplouee id ' + employeeId)
      console.log('emplouee id ' + leaveType.toLowerCase())

      // Step 5: All approved - now increment leave count
      const employeeData  = await AppDataSource.getRepository(employee)
        .createQueryBuilder()
        .select(`employee.${leaveType.toLowerCase()}`)
        .where("employee.employee_id = :employee_id", { employee_id: employeeId })
        .getOne();

      console.log('hello1')
      if (!employeeData ) {
        console.log('hello2')

        return res.status(404).json({ error: "Employee not found" });

      }
      console.log('hello3')

      const currentCount = Number(employeeData[leaveType.toLowerCase()]);
      const updatedLeaveCount = currentCount + 1;
      
      
      await AppDataSource.getRepository(employee)
        .createQueryBuilder()
        .update(employee)
        .set({ [leaveType.toLowerCase()]: updatedLeaveCount })
        .where("employee_id = :employee_id", { employee_id: employeeId })
        .execute();
  
      return res.status(200).send("Leave status updated and leave count incremented successfully");
    } catch (err) {
      console.log('hello4')

      console.error("Error updating leave status:", err);
      return res.status(500).json({ error: "Failed to update leave status" });
    }
  };
    
module.exports = {requestLeave, leaveStatus, cancelLeave, reportingLeaveStatus, updateLeaveStatus}

