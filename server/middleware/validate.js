const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    const err = new Error(message);
    err.statusCode = 400;
    return next(err);
  }

  // Override with validated/sanitized value
  req[property] = value;
  next();
};

module.exports = validate;
