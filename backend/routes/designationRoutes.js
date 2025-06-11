const express = require('express');
const router = express.Router();
const {
  CreateDesignation,
  GetDesignation,
  deleteDesignation,
  updateDesignation,
} = require('../handlers/designationHandler');
const {
  createDesignationSchema,
  designationIdSchema,
} = require('../joi_schema/desigantionSchema');
const validator = require('express-joi-validation').createValidator({});

router.post(
  '/Designation',
  validator.body(createDesignationSchema),
  CreateDesignation
);

router.get('/Designation', GetDesignation);

router.put(
  '/Designation/:DesignationID',
  validator.params(designationIdSchema),
  validator.body(createDesignationSchema),
  updateDesignation
);

router.delete(
  '/Designation/:DesignationID',
  validator.params(designationIdSchema),
  deleteDesignation
);

module.exports = router;
