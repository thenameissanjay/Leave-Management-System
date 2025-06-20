const Joi = require('joi');

const createLevelSchema = Joi.object({
  start_count: Joi.number().min(0.5).empty('').empty(null).required(),

  end_count: Joi.number().min(1).empty('').empty(null).required(),

  approval_order: Joi.number().integer().min(1).empty('').empty(null).required(),
});

const levelIdSchema = Joi.object({
   levelID: Joi.number().integer().min(1).empty('').empty(null).required(),
});



module.exports = {
  createLevelSchema,
  levelIdSchema
};
