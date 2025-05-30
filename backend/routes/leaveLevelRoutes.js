const express = require('express')
const router = express.Router();
const {getLeaveLevel, createLeaveLevel, deleteLeaveLevel, updateLeaveLevel, getLeaveLevelOrder} = require('../handlers/leaveLevelHandlers')

router.get('/getLeaveLevel', getLeaveLevel)
router.post('/createLeaveLevel', createLeaveLevel)
router.delete('/deleteLeaveLevel/:id', deleteLeaveLevel)
router.put('/updateLeaveLevel/:id', updateLeaveLevel)
router.post('/getLeaveLevelOrder', getLeaveLevelOrder)

module.exports = router
