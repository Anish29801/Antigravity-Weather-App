const Joi = require('joi');

const saveNoteSchema = Joi.object({
  text: Joi.string().allow('').default('')
});

module.exports = {
  saveNoteSchema
};
