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
    '/look-up', 
    getLeaveLevels);

router.post(
    '/look-up', 
    validator.body(createLevelSchema), 
    createLeaveLevel);
    
router.delete(
  '/look-up/:levelID',
  validator.params(levelIdSchema),
  deleteLeaveLevel
);
router.put(
  '/look-up/:levelID',
  validator.params(levelIdSchema),
  validator.body(createLevelSchema),
  updateLeaveLevel
);

module.exports = router;
