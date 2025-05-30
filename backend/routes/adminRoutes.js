const express = require('express');
const router = express.Router();
const { getEmployee, createEmployee, GetEmployee, updateEmployee, deleteEmployee, getIdNameDesg } = require('../handlers/adminHandlers');

router.post('/createEmployee', createEmployee);
router.get('/getEmployee', getEmployee);
router.get('/GetEmployee/:id', GetEmployee);
router.put('/updateEmployee/:id', updateEmployee);
router.delete('/deleteEmployee/:id', deleteEmployee);
router.get('/getIdNameDesg', getIdNameDesg);

module.exports = router;
  


