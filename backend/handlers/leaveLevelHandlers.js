const { AppDataSource } = require('../config/connection');
const { designation } = require('../entity/designation');
const { leave_level } = require('../entity/leave_level');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');
const logger = require('../logger/logger');

const designationRepo = AppDataSource.getRepository(designation);
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm);
const {
  updateLeavePolicyByDesignation,
} = require('../service/leavePolicyService');
const leaveLeaveRepo = AppDataSource.getRepository(leave_level);

/** create new leave level look up
 * POST
 * /api/leave-level/look-up
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

    const newLevel = leaveLeaveRepo.create({
      start_count,
      end_count,
      approval_order,
    });

    await leaveLeaveRepo.save(newLevel);

    res
      .status(200)
      .json({ success: true, message: 'Leave level created', data: newLevel });
  } catch (err) {
    logger.error(`leaveLevelHandler/requestLeave: ${err}`);
    res.status(500).json({ message: 'Failed to create leave level' });
  }
};

/** fetch all the leave level
 * GET
 * /api/leave-level/look-up
 */
const getLeaveLevels = async (req, res) => {
  try {
    const levels = await leaveLeaveRepo.find({
      order: { leave_level_id: 'ASC' },
    });
    res.json(levels);
  } catch (err) {
    logger.error(`leaveLevelHandler/getLeaveLevels: ${err}`);
    res.status(500).json({ message: 'No leave Level Found' });
  }
};

/** update the specific leave level
 * PUT
 * /api/leave-level/look-up/${leave_level_id}
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
    console.log(JSON.stringify(req.body, null, 2));

    const result = await leaveLeaveRepo.update(id, {
      start_count,
      end_count,
      approval_order,
    });

    if (result.affected === 0) {
      logger.error(`leaveLevelHandler/updateLeaveLevel: Leave level not found`);
      return res.status(404).json({ message: 'Leave level not found' });
    }

    res.json({ success: true, message: 'Leave level updated' });
  } catch (err) {
    logger.error(`leaveLevelHandler/updateLeaveLevel: ${err}`);
    res.status(500).json({ message: 'Failed to update leave level' });
  }
};

/** delete the specific leave level
 * DELETE
 * /api/leave-level/look-up/${id}
 */
const deleteLeaveLevel = async (req, res) => {
  try {
    const id = req.params.levelID;

    const result = await leaveLeaveRepo.softDelete(id);

    if (result.affected === 0) {
      logger.error(`leaveLevelHandler/deleteLeaveLevel: Leave level not found`);
      return res.status(404).json({ message: 'Leave level not found' });
    }
    res.json({ success: true, message: 'Leave level deleted successfully' });
  } catch (err) {
    logger.error(`leaveLevelHandler/deleteLeaveLevel: ${err}`);
    res.status(500).json({ message: 'Failed to delete leave level' });
  }
};

module.exports = {
  createLeaveLevel,
  getLeaveLevels,
  updateLeaveLevel,
  deleteLeaveLevel,
};
