const express = require('express');
const router = express.Router();
const { CreateLeaveType, GetLeaveType, updateLeaveType, deleteLeaveType } = require('../handlers/leaveTypeHandler');

router.post('/createLeaveType', CreateLeaveType);
router.get('/getLeaveType', GetLeaveType);
router.put('/updateLeaveType/:id', updateLeaveType);
router.delete('/deleteLeaveType/:id',deleteLeaveType);

module.exports = router;