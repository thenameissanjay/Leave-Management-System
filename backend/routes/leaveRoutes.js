const express = require('express')
const router = express.Router()
const {requestLeave, leaveStatus, cancelLeave, reportingLeaveStatus, updateLeaveStatus}= require('../handlers/leaveHandlers')

router.post('/requestLeave',requestLeave );
router.get('/leaveStatus/:employeeID',leaveStatus);
router.delete('/cancelLeave/:requestId',cancelLeave );
router.get('/reportingLeaveStatus/:reportingID',reportingLeaveStatus );
router.put('/updateLeaveStatus', updateLeaveStatus);

module.exports = router;