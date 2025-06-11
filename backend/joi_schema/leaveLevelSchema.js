const Joi = require('joi');

const createLevelSchema = Joi.object({
  start_count: Joi.number().integer().required(),

  end_count: Joi.number().integer().required(),

  approval_order: Joi.number().integer().required(),
});

const levelIdSchema = Joi.object({
   levelID: Joi.number().integer().required(),
});



module.exports = {
  createLevelSchema,
  levelIdSchema
};
