const express = require('express');
const router = express.Router();
const {
  getLeavePolicy,
  updateLeavePolicy,
} = require('../handlers/leavePolicyHandlersDM');

const { updateLeavePolicySchema } = require('../joi_schema/leavePolicySchema');
const validator = require('express-joi-validation').createValidator({});

router.get('/LeavePolicy', getLeavePolicy);
router.put(
  '/LeavePolicy',
  validator.body(updateLeavePolicySchema),
  updateLeavePolicy
);

module.exports = router;
