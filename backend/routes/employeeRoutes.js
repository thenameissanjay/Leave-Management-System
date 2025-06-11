const express = require('express');
const router = express.Router();
const {
  getReportingManagerName,
  getLeaveId,
  getDesignationName,
  getTotalLeave,
  TeamCalendar,
} = require('../handlers/employeeHandlers');
const {
  employeeIdSchema,
  reportingIdSchema,
} = require('../joi_schema/adminSchema');

const { designationIdSchema } = require('../joi_schema/desigantionSchema');
const validator = require('express-joi-validation').createValidator({});

router.get(
  '/DesignationName/:DesignationID',
  validator.params(designationIdSchema),
  getDesignationName
);
router.get(
  '/ReportingManagerName/:ReportingManagerID',
  validator.params(reportingIdSchema),
  getReportingManagerName
);
router.get(
  '/TotalLeave/:EmployeeID',
  validator.params(employeeIdSchema),
  getTotalLeave
);
router.get(
  '/LeaveId/:EmployeeID',
  validator.params(employeeIdSchema),
  getLeaveId
);

router.get(
  '/teamCalendar/:EmployeeID',
  validator.params(employeeIdSchema),
  TeamCalendar
);

module.exports = router;
