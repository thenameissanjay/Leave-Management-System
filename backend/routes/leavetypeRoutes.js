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
  '/leave-type',
  validator.body(createLeaveTypeSchema),
  CreateLeaveType
);

router.get('/leave-type', GetLeaveType);

router.put(
  '/leave-type/:leaveTypeID',
  validator.params(leaveTypeIdSchema),
  validator.body(createLeaveTypeSchema),
  updateLeaveType
);

router.delete(
  '/leave-type/:leaveTypeID',
  validator.params(leaveTypeIdSchema),
  deleteLeaveType
);

module.exports = router;
