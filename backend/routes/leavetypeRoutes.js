const express = require('express');
const router = express.Router();
const {
  CreateLeaveType,
  GetLeaveType,
  updateLeaveType,
  deleteLeaveType,
} = require('../handlers/leaveTypeHandler');
const {
  createLeaveTypeSchema,
  leaveTypeIdSchema,
} = require('../joi_schema/leaveTypeSchema');
const validator = require('express-joi-validation').createValidator({});

router.post(
  '/LeaveType',
  validator.body(createLeaveTypeSchema),
  CreateLeaveType
);

router.get('/LeaveType', GetLeaveType);

router.put(
  '/LeaveType/:leaveTypeID',
  validator.params(leaveTypeIdSchema),
  validator.body(createLeaveTypeSchema),
  updateLeaveType
);

router.delete(
  '/LeaveType/:leaveTypeID',
  validator.params(leaveTypeIdSchema),
  deleteLeaveType
);

module.exports = router;
