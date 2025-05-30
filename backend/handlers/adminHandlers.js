const {AppDataSource} = require('../connection')
const {employee} = require('../entity/employee')
const { leave_request } = require('../entity/leave_requests')


const employeeRepo = AppDataSource.getRepository(employee)
const leaveRepo = AppDataSource.getRepository(leave_request)
const getEmployee = async (req, res) => {
  try {
    const employees = await employeeRepo.find();
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
}

const createEmployee = async (req, res) => {
  try {
    const max = await employeeRepo
      .createQueryBuilder("employee")
      .select("MAX(employee.employee_id)", "max")
      .getRawOne();

    const nextId = (max?.max || 0) + 1;

    const newEmp = employeeRepo.create({
      employee_id: nextId,
      ...req.body,
    });

    await employeeRepo.save(newEmp);

    res.status(201).json({ success: true, employeeId: nextId });
  }
   catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create employee" });
  }
  }

 const GetEmployee = async (req, res) => {
  try {

    const employeeId = parseInt(req.params.id);
    if (!employeeId) {
      return res.status(400).json({ error: "Delete confirmation is required." });
    }
    const emp = await employeeRepo.findOneBy({ employee_id: employeeId });

    if (!emp) return res.status(404).json({ error: "Employee not found" });

    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
  }

  const updateEmployee = async  (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (!employeeId) {
        return res.status(400).json({ error: "Delete confirmation is required." });
      }
      const existing = await employeeRepo.findOneBy({ employee_id: employeeId });
  
      if (!existing) return res.status(404).json({ error: "Employee not found" });
  
      employeeRepo.merge(existing, req.body);
  
      await employeeRepo.save(existing);
  
      res.json({ success: true, message: "Employee updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update employee" });
    }
  }
  
  const deleteEmployee = async (req, res) => {

    try {
      const employeeId = parseInt(req.params.id);
      if (!employeeId) {
        return res.status(400).json({ error: "Delete confirmation is required." });
      }
      await leaveRepo.delete({ employee_id: employeeId });
      const result = await employeeRepo.delete({ employee_id: employeeId });
      
      if (result.affected === 0)
        return res.status(404).json({ error: "Employee not found" });
  
      res.json({ success: true, message: "Employee deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete employee" });
    }
  }

  const getIdNameDesg = async (req, res) => {
    try {
      const result = await employeeRepo.find({
        select: ["employee_id", "name", "designation"],
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch employee summary" });
    }
  }

module.exports = {
    getEmployee,createEmployee, GetEmployee, updateEmployee,deleteEmployee, getIdNameDesg
};