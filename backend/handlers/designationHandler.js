const conn = require('../connection');
const {AppDataSource} = require('../connection')
const {designation} = require('../entity/designation');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');

const designationRepo = AppDataSource.getRepository(designation)
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm);

const CreateDesignation = async (req, res)=>{
  try {
    const { name, description } = req.body;

    if(!name || !description){
      return res.json({message: 'required name and description'})
    }

    const newDesignation = designationRepo.create({ name, description });
    const designationId = await designationRepo.save(newDesignation);


    const LeaveTypes = await leaveTypeRepo.find();
    
    const leavePolicies = LeaveTypes.map((type) => ({
      employee_type_id:designationId.id,
      leave_type_id: type.id,
      max_days_per_year: 0
    }))
    await leavePolicyRepo.save(leavePolicies);

    res.status(201).json({ success: true, message: "Designation created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create designation", details: err.message });
  }

}

const GetDesignation = async ( req, res)=>{
  try {
    const all = await designationRepo.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch designations" });
  

}
}

const GetDesignationRole = async (req, res)=>{
  
  try {
    const roles = await designationRepo.find({ select: ["name"] });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }

}

const deleteDesignation =  async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if(!id){
      return res.json({message: 'required name and description'})
    }
    await leavePolicyRepo.delete({employee_type_id: id});
    const result = await designationRepo.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ error: "Designation not found" });
    }

    res.json({ success: true, message: "Designation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete designation", details: err.message });
  }
}

const updateDesignation = async (req,res)=>{
  const id = parseInt(req.params.id);
  
  if(!id){
    return res.json({message: 'required name and description'})
  }
  const { newName, newDescription, oldName } = req.body;

  try {
    // Update designation
    await designationRepo.update(id, {
      name: newName,
      description: newDescription,
    });
    


    res.json({ success: true, message: "Designation updated successfully" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to update designation", details: err.message });
  }
}

module.exports = {CreateDesignation, GetDesignation, deleteDesignation, GetDesignationRole, updateDesignation}