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
    '/Employee', 
    validator.body(createEmployeeSchema), 
    createEmployee);

router.get('/Employee', getEmployee);

router.get(
    '/Employee/:EmployeeID', 
    validator.params(employeeIdSchema), 
    GetEmployee);

router.put(
  '/Employee/:EmployeeID',
  validator.params(employeeIdSchema),
  validator.body(updateEmployeeSchema),
  updateEmployee
);

router.delete(
    '/Employee/:EmployeeID', 
    validator.params(employeeIdSchema),
    deleteEmployee);

router.get('/EmployeeIdNameDesg', EmployeeIdNameDesg);

module.exports = router;
