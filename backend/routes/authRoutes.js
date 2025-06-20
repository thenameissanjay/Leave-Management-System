const express = require('express');
const router = express.Router();
const {
  createPassword,
  employeeLogin,
  adminLogin,
} = require('../handlers/authHandlers');
const {
  createpasswordSchema,
  adminLoginSchema,
  employeeLoginSchema,
} = require('../joi_schema/authSchema');
const validator = require('express-joi-validation').createValidator({ passError: true});
const {RateLimiter} = require('../utils/rateLimit')
router.post(
  '/employee-login',
  validator.body(employeeLoginSchema),
  // RateLimiter,
  employeeLogin
);

router.post(
    '/admin-login', 
    validator.body(adminLoginSchema), 
    adminLogin);
    
router.post(
  '/password',
  validator.body(createpasswordSchema),
  createPassword
);

module.exports = router;
