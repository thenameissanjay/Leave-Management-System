const express = require('express')
const router = express.Router()
const {getIdNameDesg, getName, getWhereDesg,getIdNameDesgId,getLeave,getTotalLeave, getLeaveLevelOrder, getCalendar} = require('../handlers/employeeHandlers')

router.get('/getIdNameDesg', getIdNameDesg )   // all frotnene- /api/employee/getIDNameDesg -> serer.js
router.get('/getIdNameDesg/:id', getIdNameDesgId )   // <- id
router.get('/getWhereDesg', getWhereDesg )           // <- role
router.get('/getName/:id', getName)
router.get('/getLeave/:id', getLeave)
router.get('/getTotalLeave/:id', getTotalLeave);
router.post('/getLeaveLevelOrder', getLeaveLevelOrder);

router.get('/getCalendar/:id', getCalendar);


module.exports = router;