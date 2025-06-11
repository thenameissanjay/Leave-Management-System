const express = require('express');
const router = express.Router();
const {
  requestLeave,
  leaveStatus,
  cancelLeave,
  incomingHistory,
  reportingLeaveStatus,
  updateLeaveStatus,
} = require('../handlers/leaveHandlers');
const {
  createRequestSchema,
  incomingLeaveSchema,
  approveLeaveSchema,
} = require('../joi_schema/leaveSchema');
const { employeeIdSchema } = require('../joi_schema/adminSchema');
const validator = require('express-joi-validation').createValidator({});

router.post('/requestLeave', validator.body(createRequestSchema), requestLeave);
router.get(
  '/incomingHistory/:EmployeeID',
  validator.params(employeeIdSchema),
  incomingHistory
);
router.get(
  '/leaveStatus/:EmployeeID',
  validator.params(employeeIdSchema),
  leaveStatus
);

router.get(
  '/reportingLeaveStatus',
  validator.query(incomingLeaveSchema),
  reportingLeaveStatus
);
router.put(
  '/updateLeaveStatus',
  validator.body(approveLeaveSchema),
  updateLeaveStatus
);
router.delete('/cancelLeave/:requestId', cancelLeave);

module.exports = router;
