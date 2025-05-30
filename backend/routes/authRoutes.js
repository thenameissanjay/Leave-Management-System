const express = require('express');
const router = express.Router();
const { createPassword, employeeLogin, adminLogin} = require('../handlers/authHandlers')

router.post('/employeeLogin', employeeLogin)
router.post('/adminlogin', adminLogin)
router.post('/createPassword', createPassword )

module.exports = router;
