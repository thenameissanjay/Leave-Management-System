const conn = require('../connection');
const {AppDataSource} = require('../connection')
const {designation} = require('../entity/designation');
const { leave_level } = require('../entity/leave_level');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');

const designationRepo = AppDataSource.getRepository(designation)
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm);
const {updateLeavePolicyByDesignation} = require('../service/leavePolicyService')
const leaveLeaveRepo = AppDataSource.getRepository(leave_level)

/**
 * POST
 * /api/leavelevel/look-up
 * req.body =
 * {
  "start_count": 1,
  "end_count": 2,
  "approval_order": 1
}
 */
const createLeaveLevel = async (req, res) => {
  try {
    const { start_count, end_count, approval_order } = req.body;
    if (
      start_count === undefined ||
      end_count === undefined ||
      approval_order === undefined
    ) {
      return res
        .status(400)
        .json({ message: "start_count, end_count, and approval_order are required" });
    }
    const newLevel = leaveLeaveRepo.create({
      start_count,
      end_count,
      approval_order,
    });

    await leaveLeaveRepo.save(newLevel);

    res.status(200).json({ success: true, message: "Leave level created", data: newLevel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create leave level", details: err.message });
  }
};

/**
 * GET
 * /api/leavelevel/look-up
 */
const getLeaveLevels = async (req, res) => {
  try {
    const levels = await leaveLeaveRepo.find({ order: { leave_level_id: "ASC" } });
    res.json(levels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leave levels", details: err.message });
  }
};

/**
 * PUT
 * /api/leavelevel/look-up/${leave_level_id}
 * req.body =
 * {
  "start_count": 1,
  "end_count": 2,
  "approval_order": 1
  }
 */
const updateLeaveLevel = async (req, res) => {
  try {
    const id = req.params.levelID;
    const { start_count, end_count, approval_order } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Invalid or missing ID" });
    }


    const result = await leaveLeaveRepo.update(id, {
      start_count,
      end_count,
      approval_order,
    });

    if (result.affected === 0) {
      return res.status(404).json({ error: "Leave level not found" });
    }

    res.json({ success: true, message: "Leave level updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update leave level", details: err.message });
  }
};

/**
 * DELETE
 * /api/leavelevel/look-up/${id}
 */
const deleteLeaveLevel = async (req, res) => {
  try {
    const id = req.params.levelID;

    if (!id) {
      return res.status(400).json({ message: "Invalid or missing ID" });
    }
    const result = await leaveLeaveRepo.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ error: "Leave level not found" });
    }

    res.json({ success: true, message: "Leave level deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete leave level", details: err.message });
  }
};

module.exports = {
  createLeaveLevel,
  getLeaveLevels,
  updateLeaveLevel,
  deleteLeaveLevel,
};
