const { AppDataSource } = require('../config/connection');
const { designation } = require('../entity/designation');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');
const { employee } = require('../entity/employee');
const logger = require('../logger/logger');

const designationRepo = AppDataSource.getRepository(designation);
const employeeRepo = AppDataSource.getRepository(employee);

const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm);
const {
  updateLeavePolicyByDesignation,
} = require('../service/leavePolicyService');
const { exist } = require('joi');

/**
 * POST
 * /api/designation/designation
 * req.body =
 * {
  "name": "intern",
  "description": "intern"
 }
 */
const CreateDesignation = async (req, res) => {
  try {
    // name = 'intern'
    const { name, description } = req.body;

    const newDesignation = designationRepo.create({ name, description });
    const designationId = await designationRepo.save(newDesignation);

    // add 'intern' to Leave Policy entity
    await updateLeavePolicyByDesignation(designationId.id);

    res.status(201).json({ success: true, message: 'Designation created' });
  } catch (err) {
    logger.error(`designation/CreateDesignation: ${err}`);
    res
      .status(500)
      .json({ message: 'Failed to create designation' });
  }
};

/** fetching all designation
 * GET
 * /api/designation/designation
 */
const GetDesignation = async (req, res) => {
  try {
    const allDesignation = await designationRepo.find();
    res.json(allDesignation);
  } catch (err) {
    logger.error(`designation/GetDesignation: ${err}`);

    res.status(500).json({ message: 'Failed to fetch designations' });
  }
};

/** delete designation
 * DELETE
 * /api/designation/designation/${DesignationId}
 */

const deleteDesignation = async (req, res) => {
  try {
    const id = req.params.DesignationID;

    // checking employee table
    const exists = await employeeRepo.find({
      where: { designation: id },
    });

    // if no employee assigned to this role
    if (exists.length == 0) {
      // deleting designation in Leave Policy Entity
      await leavePolicyRepo.softDelete({ employee_type_id: id });
      // deleting designation in Designation entity
      await designationRepo.softDelete(id);
    } else {
      logger.error(`designation/deleteDesignation: NO Employee Exists in that role`);
      return res.status(400).json({ message: 'NO Employee exists in that role' });
    }

    return res.json({
      success: true,
      message: 'Designation deleted successfully',
    });
  } catch (err) {
    logger.error(`designation/deleteDesignation: ${err}`);
    return res.status(500).json({ message: 'Failed to delete designation' });
  }
};

/**
 * PUT
 * /api/designation/designation/${designationID}
 * req.body =
 * {
  "name": "intern",
  "description": "intern"
 }
 */
const updateDesignation = async (req, res) => {
  const id = req.params.DesignationID;

  const { name, description } = req.body;

  try {
    // Update designation by ID
    await designationRepo.update(id, {
      name: name,
      description: description,
    });

    res.json({ success: true, message: 'Designation updated successfully' });
  } catch (err) {
    logger.error(`designation/updateDesignation: ${err}`);
    res
      .status(500)
      .json({ message: 'Failed to update designation' });
  }
};

module.exports = {
  CreateDesignation,
  GetDesignation,
  deleteDesignation,
  updateDesignation,
};
