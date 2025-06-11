const {AppDataSource} = require('../connection');
const { designation } = require('../entity/designation');
const { leave_policy_dm } = require('../entity/leave_policy_dm');
const { leave_type_dm } = require('../entity/leave_type_dm');
const employeeTypeRepo = AppDataSource.getRepository(designation);
const leavePolicyRepo = AppDataSource.getRepository(leave_policy_dm)
const leaveTypeRepo = AppDataSource.getRepository(leave_type_dm);


const updateLeavePolicyByLeaveType = async (leavetypeId) => {
         // 2. Get all employee types
         const employeeTypes = await employeeTypeRepo.find(); // assuming employeeTypeRepo is your repository
  
         if (!employeeTypes.length) {
           return res.status(404).json({ message: 'No employee types found to assign the leave policy' });
         }
     
         // 3. Prepare leave policy records (initialize with 0 days)
         const leavePolicies = employeeTypes.map((empType) => ({
           employee_type_id: empType.id,
           leave_type_id: leavetypeId,
           max_days_per_year:0, // you can make this dynamic or configurable
           accrual_leave: 0
         }));
     
         // 4. Save all policies
         await leavePolicyRepo.save(leavePolicies); // assuming leavePolicyRepo is your repository
     
}


const updateLeavePolicyByDesignation = async (designationId) =>{

  try {
    // fetchign leave types = [sick, casual]
    const LeaveTypes = await leaveTypeRepo.find();
    
    // intern.sick = 0 , intern.casual = 0
    const leavePolicies = LeaveTypes.map((type) => ({
      employee_type_id:designationId,
      leave_type_id: type.id,
      max_days_per_year: 0,
      accrual_leave: 0

    }))
    await leavePolicyRepo.save(leavePolicies);
  } catch (error) {
    return console.log(error)
  }

}
module.exports = {updateLeavePolicyByLeaveType, updateLeavePolicyByDesignation}