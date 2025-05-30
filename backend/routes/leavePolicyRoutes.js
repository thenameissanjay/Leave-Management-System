const express = require('express')
const router = express.Router()
const { getLeave, createLeave, updateLeave, deleteLeave} = require('../handlers/leavePolicyHandlers')

router.get('/getLeave', getLeave)
router.post('/createLeave', createLeave)
router.put('/updateLeave/:id', updateLeave )
router.delete('/deleteLeave/:id', deleteLeave)

module.exports = router
