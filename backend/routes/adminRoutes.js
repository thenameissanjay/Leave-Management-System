const express = require('express');
const router = express.Router();
const {
  getEmployee,
  createEmployee,
  GetEmployee,
  updateEmployee,
  deleteEmployee,
  EmployeeIdNameDesg,
} = require('../handlers/adminHandlers');
const {
  createEmployeeSchema,
  employeeIdSchema,
  updateEmployeeSchema,
} = require('../joi_schema/adminSchema');
const validator = require('express-joi-validation').createValidator({});

router.post(
    '/employee', 

    createEmployee);

router.get('/employee', getEmployee);

router.get(
    '/employee/:EmployeeID', 
    validator.params(employeeIdSchema), 
    GetEmployee);

router.put(
  '/employee/:EmployeeID',
  validator.params(employeeIdSchema),
  validator.body(updateEmployeeSchema),
  updateEmployee
);

router.delete(
    '/employee/:EmployeeID', 
    validator.params(employeeIdSchema),
    deleteEmployee);

router.get('/employee-id-name-desg', EmployeeIdNameDesg);

module.exports = router;
