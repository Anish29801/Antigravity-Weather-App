const Joi = require('joi');

const createTaskSchema = Joi.object({
  text: Joi.string().trim().required().messages({
    'any.required': 'Task text is required'
  }),
  category: Joi.string().valid('Code', 'Design', 'Work', 'Life').required().messages({
    'any.only': 'Category must be one of Code, Design, Work, or Life',
    'any.required': 'Category is required'
  })
});

const updateTaskSchema = Joi.object({
  text: Joi.string().trim(),
  category: Joi.string().valid('Code', 'Design', 'Work', 'Life'),
  completed: Joi.boolean()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema
};
