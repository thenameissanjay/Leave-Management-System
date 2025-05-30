const express = require('express');
const router = express.Router();
const { CreateDesignation, GetDesignation, deleteDesignation, GetDesignationRole, updateDesignation } = require('../handlers/designationHandler');

router.post('/createDesignation', CreateDesignation);
router.get('/getDesignation', GetDesignation);
router.get('/getDesignationRole', GetDesignationRole);
router.put('/updateDesignation/:id',updateDesignation);
router.delete('/deleteDesignation/:id', deleteDesignation);

module.exports = router;
