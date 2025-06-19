const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getEmployee,
  createEmployee,
  GetEmployee,
  updateEmployee,
  deleteEmployee,
  EmployeeIdNameDesg,
  replaceReportingManager,
  bulkUpload
} = require('../handlers/adminHandlers');
const {
  createEmployeeSchema,
  employeeIdSchema,
  updateEmployeeSchema,
} = require('../joi_schema/adminSchema');
const validator = require('express-joi-validation').createValidator({ passError: true});

router.post(
  '/employee', 
  validator.body(createEmployeeSchema), 
  createEmployee);

router.get('/employee', getEmployee);

router.get(
  '/employee/:EmployeeID',
  validator.params(employeeIdSchema),
  GetEmployee
);

router.put(
  '/employee/:EmployeeID',
  validator.params(employeeIdSchema),
  validator.body(updateEmployeeSchema),
  updateEmployee
);

router.delete(
  '/employee/:EmployeeID',
  validator.params(employeeIdSchema),
  deleteEmployee
);

router.get('/employee-id-name-desg', EmployeeIdNameDesg);


router.put('/replace-reporting-manager', replaceReportingManager);


// creating the storage
const upload = multer({ storage: multer.memoryStorage() });
// binary data -> stored in memory
router.post('/employee/bulk-upload',upload.single('uploadedFile'),  bulkUpload)

module.exports = router;
