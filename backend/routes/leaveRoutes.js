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

router.post('/request-leave', validator.body(createRequestSchema), requestLeave);
router.get(
  '/incoming-history/:EmployeeID',
  validator.params(employeeIdSchema),
  incomingHistory
);
router.get(
  '/leave-status/:EmployeeID',
  validator.params(employeeIdSchema),
  leaveStatus
);

router.get(
  '/reporting-leave-status',
  validator.query(incomingLeaveSchema),
  reportingLeaveStatus
);
router.put(
  '/update-leave-status',
  validator.body(approveLeaveSchema),
  updateLeaveStatus
);
router.delete('/cancelLeave/:requestId', cancelLeave);

module.exports = router;
