const { AppDataSource } = require('../config/connection');
const { designation } = require('../entity/designation');
const { employee } = require('../entity/employee');
const { leave_balance } = require('../entity/leave_balance');
const { leave_request } = require('../entity/leave_requests');
const { parse } = require('csv-parse/sync');
const {employeeQueue} = require('../config/redis-queue')

const {
  updateLeaveBalanceByEmployee,
} = require('../service/leavebalanceService');
const logger = require('../logger/logger');
const multer = require('multer');

const employeeRepo = AppDataSource.getRepository(employee);
const leaveRepo = AppDataSource.getRepository(leave_request);
const designationRepo = AppDataSource.getRepository(designation);
const leaveBalanceRepo = AppDataSource.getRepository(leave_balance);

/**
 * Get All Employees
 * GET
 * /api/admin/employee
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
    logger.error(`adminHandler/getEmployee: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

/** Create New Employee
 * POST  
 * /api/admin/employee
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
    logger.error(`/adminHandler/createEmployee: ${err}`);
    res.status(500).json({ message: 'Failed to create employee' });
  }
};

/**  Fetching Specific Employee
 * GET
 * /api/admin/employee/${EmployeeID}
 */
const GetEmployee = async (req, res) => {
  try {
    const employeeId = req.params.EmployeeID;

    const emp = await employeeRepo.findOneBy({ employee_id: employeeId });

    if (!emp) {
      logger.error('/adminHandler/GetEmployee: employee not Found');
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(emp);
  } catch (err) {
    logger.error(`adminHandler/GetEmployee: ${err}`);
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
};

/**  Updating Specific Employee
   * PUT
   * /api/admin/employee/${EmployeeID}
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

    // return only one row
    const employee = await employeeRepo.findOneBy({ employee_id: employeeId });

    if (!employee) {
      logger.error('/adminHandler/updateEmployee: Employee not found');
      return res.status(404).json({ message: 'Employee not found' });
    }

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
    logger.error(`adminHandler/updateEmployee: ${err}`);
    res.status(500).json({ message: 'Failed to update employee' });
  }
};

/**  Delete Specific Employee
 * DELETE
 * /api/admin/employee/${employeeId}
 */

const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.EmployeeID;

    // deleting Employee in Leave Request Entity
    await leaveRepo.softDelete({ employee_id: employeeId });
    // deleting Employee in Leave Balance Entity
    await leaveBalanceRepo.softDelete({ employee_id: employeeId });
    // deleting Employee in Employee Entity
    await employeeRepo.softDelete({ employee_id: employeeId });

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    logger.error(`adminHandler/deleteEmployee: ${err}`);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};

/** Fetch Specific EmployeeID, Name, Designation -> [reporting Manager Selection dropdown])
 * GET
 * /api/admin/employee-id-name-desg
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
    logger.error(`adminHandler/EmployeeIdNameDesg: ${err}`);

    return res.status(500).json({ message: 'Failed to fetch employees' });
  }
};


/**
 * POST
 * "create new employees BULK UPLOAD"
 * form{
 * uploadedFile: binaryData
 * }
 * using multer middleware 
 *  req.file: {
    fieldname: 'uploadedFile',
    originalname: 'employee.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: <Buffer 6e 61 6d 65 2c 65 6d 61 69 6c 2c 70 68 6f 6e 65 2c 64 65 73 69 67 6e 61 74 69 6f 6e 2c 64 61 74 65 5f 6f 66 5f 6a 6f 69 6e 69 6e 67 2c 72 65 70 6f 72 ... 743 more bytes>,
    size: 793
  },
 */

const bulkUpload =  async (req, res) => {
  try {
    const csvBuffer = req.file.buffer; // file content stored as raw binary data
    
    // string to JSON
    const records = parse(csvBuffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const JOB_SIZE = 1;  //  1 row in Job
    for (let i = 0; i < records.length; i += JOB_SIZE) {
      const job = records.slice(i, i + JOB_SIZE);
     
      // Adding in Queue
      await employeeQueue.add('bulk-upload-queue', job, {
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
    res.json({message :`Queued Added`});
  } catch (err) {
    logger.error('Upload failed:', err);
    res.status(500).send('Error processing file');
  }
};

module.exports = {
  getEmployee,
  createEmployee,
  GetEmployee,
  updateEmployee,
  deleteEmployee,
  EmployeeIdNameDesg,
  bulkUpload
};
