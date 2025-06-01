const express = require('express')
const router = express.Router()
const { getLeavePolicy} = require('../handlers/leavePolicyHandlersDM')

router.get('/getLeavePolicy', getLeavePolicy);

module.exports = router
