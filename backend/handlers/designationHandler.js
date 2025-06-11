const conn = require('../connection');
const { AppDataSource } = require('../connection');
const { designation } = require('../entity/designation');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');

const designationRepo = AppDataSource.getRepository(designation);
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm);
const {
  updateLeavePolicyByDesignation,
} = require('../service/leavePolicyService');

/**
 * POST
 * /api/designation/Designation
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

    if (!name || !description) {
      return res.json({ message: 'required name and description' });
    }

    const newDesignation = designationRepo.create({ name, description });
    const designationId = await designationRepo.save(newDesignation);

    // add 'intern' to Leave Policy entity
    await updateLeavePolicyByDesignation(designationId.id);

    res.status(201).json({ success: true, message: 'Designation created' });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to create designation', details: err.message });
  }
};

/** fetching all designation
 * GET
 * /api/designation/Designation
 */
const GetDesignation = async (req, res) => {
  try {
    const allDesignation = await designationRepo.find();
    res.json(allDesignation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch designations' });
  }
};

/** delete designation
 * DELETE
 * /api/designation/Designation/${DesignationId}
 */

const deleteDesignation = async (req, res) => {
  try {
    const id = req.params.DesignationID;

    if (!id) {
      return res.json({ message: 'required name and description' });
    }
    // aslo delet the employee table
    // deleting designation in Leave Policy Entity
    await leavePolicyRepo.delete({ employee_type_id: id });
    // deleting designation in Designation entity
    await designationRepo.delete(id);

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
 * /api/designation/Designation/${designationID}
 * req.body =
 * {
  "name": "intern",
  "description": "intern"
 }
 */
const updateDesignation = async (req, res) => {
  const id = req.params.DesignationID;

  if (!id) {
    return res.json({ message: 'required name and description' });
  }
  const { name, description } = req.body;

  try {
    // Update designation by ID
    await designationRepo.update(id, {
      name: name,
      description: description,
    });

    res.json({ success: true, message: 'Designation updated successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to update designation', details: err.message });
  }
};

module.exports = {
  CreateDesignation,
  GetDesignation,
  deleteDesignation,
  updateDesignation,
};
