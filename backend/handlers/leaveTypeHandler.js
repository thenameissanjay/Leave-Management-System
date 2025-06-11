const conn = require('../connection');
const { AppDataSource } = require('../connection');
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

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: 'Name and description are required' });
    }

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
    console.error(err);
    return res.status(500).json({
      error: 'Failed to create leave type and assign policies',
      details: err.message,
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
    res.status(500).json({ error: 'Failed to fetch designations' });
  }
};

/**
 * DELETE
 * /api/leavetype/leave-type/${id}
 */ 
const deleteLeaveType = async (req, res) => {
  try {
    const id = req.params.leaveTypeID;
    if (!id) {
      return res.json({ message: 'required name and description' });
    }
    // deleting Leave type in Leave Policy entity
    await leavePolicyRepo.delete({ leave_type_id: id });
    // deleting Leave Type in Leave Balance entity
    await leaveBalanceRepo.delete({ leave_type_id: id });
    // deleting Leave type in Leave Type entity
    await leaveTypeRepo.delete({ id });

    res.json({ success: true, message: 'Designation deleted successfully' });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: 'Failed to delete designation', details: err.message });
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

  if (!id) {
    return res.json({ message: 'required name and description' });
  }

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
    res
      .status(500)
      .json({ error: 'Failed to update designation', details: err.message });
  }
};

module.exports = {
  CreateLeaveType,
  GetLeaveType,
  deleteLeaveType,
  updateLeaveType,
};
