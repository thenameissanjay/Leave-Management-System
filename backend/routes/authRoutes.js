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
  '/employee-login',
  validator.body(employeeLoginSchema),
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
