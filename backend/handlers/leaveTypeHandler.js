const { AppDataSource } = require('../config/connection');
const { leave_balance } = require('../entity/leave_balance');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');
const {
  updateLeavePolicyByLeaveType,
} = require('../service/leavePolicyService');
const {
  updateLeaveBalanceByLeavetype,
} = require('../service/leavebalanceService');
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm);
const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);
const logger = require('../logger/logger');

/**
 * POST
 * /api/leavetype/leave-type
 * req.body =
 * {
  "name": "sick",
  "description": "sick",
  "yearAccrual": False,
    "monthAccrual": False,
   }
 */
const CreateLeaveType = async (req, res) => {
  try {
    const { name, description, yearAccrual, monthAccrual } = req.body;

    // creating new Leave Type
    const newLeaveType = leaveTypeRepo.create({
      name,
      description,
      yearAccrual,
      monthAccrual,
    });
    const savedLeaveType = await leaveTypeRepo.save(newLeaveType);

    // updating leave Policy table
    await updateLeavePolicyByLeaveType(savedLeaveType.id);

    // updating Leave balance table
    await updateLeaveBalanceByLeavetype(savedLeaveType.id);

    return res.status(201).json({
      success: true,
      message:
        'Leave type created and policies initialized for all employee types',
      leaveType: savedLeaveType,
    });
  } catch (err) {
    logger.error(`leaveTypeHandler/CreateLeaveType: ${err}`);
    return res.status(500).json({
      
      message: 'Failed to create leave type and assign policies',
    });
  }
};

/**
 * GET
 * /api/leavetype/leave-type
 */
const GetLeaveType = async (req, res) => {
  try {
    const allLeaveType = await leaveTypeRepo.find();
    res.json(allLeaveType);
  } catch (err) {
    logger.error(`leaveTypeHandler/GetLeaveType: ${err}`);
    res.status(500).json({ message: 'Failed to fetch designations' });
  }
};

/**
 * DELETE
 * /api/leavetype/leave-type/${id}
 */ 
const deleteLeaveType = async (req, res) => {
  try {
    const id = req.params.leaveTypeID;

    // deleting Leave type in Leave Policy entity
    await leavePolicyRepo.softDelete({ leave_type_id: id });
    // deleting Leave Type in Leave Balance entity
    await leaveBalanceRepo.softDelete({ leave_type_id: id });
    // deleting Leave type in Leave Type entity
    await leaveTypeRepo.softDelete({ id });

    res.json({ success: true, message: 'Designation deleted successfully' });
  } catch (err) {
    logger.error(`leaveTypeHandler/deleteLeaveType: ${err}`);
    res
      .status(500)
      .json({ message: 'Failed to delete designation'});
  }
};

/**
 * PUT
 * /api/leavetype/leave-type/${id}
 * req.body =
 * {
  "name": "sick",
  "description": "sick",
  "yearAccrual": True,
  "monthAccrual": True
   }
 */
const updateLeaveType = async (req, res) => {
  const id = req.params.leaveTypeID;

  const { name, description, yearAccrual, monthAccrual } = req.body;
  try {
    // Update Leave type
    await leaveTypeRepo.update(id, {
      name: name,
      description: description,
      yearAccrual: yearAccrual,
      monthAccrual: monthAccrual,
    });
    res.json({ success: true, message: 'Designation updated successfully' });
  } catch (err) {
    logger.error(`leaveTypeHandler/updateLeaveType: ${err}`);
    res
      .status(500)
      .json({ message: 'Failed to update designation' });
  }
};

module.exports = {
  CreateLeaveType,
  GetLeaveType,
  deleteLeaveType,
  updateLeaveType,
};
