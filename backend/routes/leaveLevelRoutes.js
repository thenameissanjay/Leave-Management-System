const express = require('express');
const router = express.Router();
const {
  createLeaveLevel,
  getLeaveLevels,
  updateLeaveLevel,
  deleteLeaveLevel,
} = require('../handlers/leaveLevelHandlers');
const {
  createLevelSchema,
  levelIdSchema,
} = require('../joi_schema/leaveLevelSchema');
const validator = require('express-joi-validation').createValidator({});

router.get(
    '/lookup', 
    getLeaveLevels);

router.post(
    '/lookup', 
    validator.body(createLevelSchema), 
    createLeaveLevel);
    
router.delete(
  '/lookup/:levelID',
  validator.params(levelIdSchema),
  deleteLeaveLevel
);
router.put(
  '/lookup/:levelID',
  validator.params(levelIdSchema),
  validator.body(createLevelSchema),
  updateLeaveLevel
);

module.exports = router;
