const { AppDataSource } = require('../connection');
const { designation } = require('../entity/designation');
const { employee } = require('../entity/employee');
const { leave_balance } = require('../entity/leave_balance');
const { leave_request } = require('../entity/leave_requests');
const {
  updateLeaveBalanceByEmployee,
} = require('../service/leavebalanceService');

const employeeRepo = AppDataSource.getRepository(employee);
const leaveRepo = AppDataSource.getRepository(leave_request);
const designationRepo = AppDataSource.getRepository(designation);
const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);

/**
 * Get All Employees
 * GET
 * /api/admin/Employee
 */
const getEmployee = async (req, res) => {
  try {
    const employees = await employeeRepo.find({
      relations: ['designation'],
    });

    // return array of objects
    const formattedEmployees = employees.map((emp) => ({
      employee_id: emp.employee_id,
      name: emp.name,
      email: emp.email,
      level: emp.level,
      date_of_joining: emp.date_of_joining,
      phone: emp.phone,
      reporting_to: emp.reporting_to,
      password: emp.password,
      designation: emp.designation?.name || null, // return designation name
    }));

    res.json(formattedEmployees);
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

/**
 * POST  
 * /api/admin/Employee
 * req.body = 
 * {
  "name": "sanjay kumar",
  "email": "sanjaykumar@gmail.com",
  "phone": "1234567890",
  "designation": 34,
  "reporting_to": 21,
  "date_of_joining": "2025-06-06",
  "password": ""
  }
 */

const createEmployee = async (req, res) => {
  // console.log(JSON.stringify(req.body, null, 2))
  try {
    // creating instance
    const newEmployee = employeeRepo.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      designation: req.body.designation,
      reporting_to: req.body.reporting_to,
      date_of_joining: req.body.date_of_joining,
      password: '',
    });

    // adding New Employee
    await employeeRepo.save(newEmployee);

    // adding Leave Balance for New Employee
    await updateLeaveBalanceByEmployee(newEmployee);

    res
      .status(201)
      .json({ success: true, employeeId: newEmployee.employee_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

/**  Fetching Specific Employee
 * GET
 * /api/admin/Employee/${EmployeeID}
 */
const GetEmployee = async (req, res) => {
  try {
    const employeeId = req.params.EmployeeID;
    if (!employeeId) {
      return res
        .status(400)
        .json({ error: 'Delete confirmation is required.' });
    }

    const emp = await employeeRepo.findOneBy({ employee_id: employeeId });

    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

/**  Updating Specific Employee
   * PUT
   * /api/admin/Employee/${EmployeeID}
   * 
   * req.body =
   * {
     "name": "sanjay kumar",
     "email": "sanjaykumar@gmail.com",
     "phone": "1234567890",
     "designation": 34,
     "reporting_to": 21,
     "date_of_joining": "2025-06-06",
   * }
   */
const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.EmployeeID;
    console.log(JSON.stringify(req.body, null, 2));
    if (!employeeId) {
      return res
        .status(400)
        .json({ error: 'Delete confirmation is required.' });
    }
    // return only one row
    const employee = await employeeRepo.findOneBy({ employee_id: employeeId });

    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // employeeRepo.merge(employee, req.body);
    employee.name = req.body.name;
    employee.email = req.body.email;
    employee.phone = req.body.phone;
    employee.designation = req.body.designation;
    employee.reporting_to = req.body.reporting_to;
    employee.date_of_joining = req.body.date_of_joining;
    await employeeRepo.save(employee);

    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

/**  Delete Specific Employee
 * DELETE
 * /api/admin/Employee/${employeeId}
 */

const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.EmployeeID;
    if (!employeeId) {
      return res
        .status(400)
        .json({ error: 'Delete confirmation is required.' });
    }
    // deleting Employee in Leave Request Entity
    await leaveRepo.delete({ employee_id: employeeId });
    // deleting Employee in Leave Balance Entity
    await leaveBalanceRepo.delete({ employee_id: employeeId });
    // deleting Employee in Employee Entity
    await employeeRepo.delete({ employee_id: employeeId });

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

/** Fetch Specific EmployeeID, Name, Designation -> Dropdown UI
 * GET
 * /api/admin/EmployeeIdNameDesg
 */
const EmployeeIdNameDesg = async (req, res) => {
  try {
    const employees = await employeeRepo.find({
      relations: ['designation'], // join by designationID
      select: {
        employee_id: true,
        name: true,
        designation: {
          name: true,
        },
      },
    });

    const response = employees
      .filter((emp) => emp.name !== 'admin')
      .map((emp) => ({
        employee_id: emp.employee_id,
        name: emp.name,
        designation: emp.designation?.name ?? null,
      }));

    res.json(response);
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

module.exports = {
  getEmployee,
  createEmployee,
  GetEmployee,
  updateEmployee,
  deleteEmployee,
  EmployeeIdNameDesg,
};
