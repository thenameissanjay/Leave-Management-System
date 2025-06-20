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
const validator = require('express-joi-validation').createValidator({passError: true});

router.get(
  '/designation-name/:DesignationID',
  validator.params(designationIdSchema),
  getDesignationName
);
router.get(
  '/reporting-manager-name/:ReportingManagerID',
  validator.params(reportingIdSchema),
  getReportingManagerName
);
router.get(
  '/total-leave/:EmployeeID',
  validator.params(employeeIdSchema),
  getTotalLeave
);
router.get(
  '/leave-id/:EmployeeID',
  validator.params(employeeIdSchema),
  getLeaveId
);

router.get(
  '/team-calendar/:EmployeeID',
  validator.params(employeeIdSchema),
  TeamCalendar
);

module.exports = router;
