const conn = require('../connection');
const {AppDataSource} = require('../connection')
const {designation} = require('../entity/designation');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');
const employeeTypeRepo = AppDataSource.getRepository(designation);
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm)

const CreateLeaveType = async (req, res) => {
    try {
      const { name, description } = req.body;
  
      if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
      }
  
      // 1. Create the new leave type
      const newLeaveType = leaveTypeRepo.create({ name, description });
      const savedLeaveType = await leaveTypeRepo.save(newLeaveType);
  
      // 2. Get all employee types
      const employeeTypes = await employeeTypeRepo.find(); // assuming employeeTypeRepo is your repository
  
      if (!employeeTypes.length) {
        return res.status(404).json({ message: 'No employee types found to assign the leave policy' });
      }
  
      // 3. Prepare leave policy records (initialize with 0 days)
      const leavePolicies = employeeTypes.map((empType) => ({
        employee_type_id: empType.id,
        leave_type_id: savedLeaveType.id,
        max_days_per_year:0 // you can make this dynamic or configurable
      }));
  
      // 4. Save all policies
      await leavePolicyRepo.save(leavePolicies); // assuming leavePolicyRepo is your repository
  
      return res.status(201).json({
        success: true,
        message: "Leave type created and policies initialized for all employee types",
        leaveType: savedLeaveType
      });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to create leave type and assign policies",
        details: err.message
      });
    }
  };
  

const GetLeaveType = async ( req, res)=>{
  try {
    const all = await leaveTypeRepo.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch designations" });
  

}
}


const deleteLeaveType =  async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('helloo')
    if(!id){
      return res.json({message: 'required name and description'})
    }
    await leavePolicyRepo.delete({leave_type_id: id})
    const result = await leaveTypeRepo.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ error: "Designation not found" });
    }

    res.json({ success: true, message: "Designation deleted successfully" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to delete designation", details: err.message });
  }
}

const updateLeaveType = async (req,res)=>{
  const id = parseInt(req.params.id);
  
  if(!id){
    return res.json({message: 'required name and description'})
  }
  const { newName, newDescription, oldName } = req.body;

  try {
    // Update designation
    await leaveTypeRepo.update(id, {
      name: newName,
      description: newDescription,
    });

    // Update employee.designation where old name was used
    // await employeeRepo
    //   .createQueryBuilder()
    //   .update()
    //   .set({ designation: newName })
    //   .where("designation = :oldName", { oldName })
    //   .execute();

    res.json({ success: true, message: "Designation updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update designation", details: err.message });
  }
}

module.exports = {CreateLeaveType, GetLeaveType, deleteLeaveType, updateLeaveType}