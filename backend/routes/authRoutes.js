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
const validator = require('express-joi-validation').createValidator({});

router.post(
  '/employeeLogin',
  validator.body(employeeLoginSchema),
  employeeLogin
);

router.post(
    '/adminlogin', 
    validator.body(adminLoginSchema), 
    adminLogin);
    
router.post(
  '/Password',
  validator.body(createpasswordSchema),
  createPassword
);

module.exports = router;
