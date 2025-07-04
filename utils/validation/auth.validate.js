const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

module.exports.registerValidate = (request, response, next) => {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(100).required(),
    email: joi.string().trim().min(5).max(100).required().email(),
    password: passwordComplexity().required(),
  });
  const { error } = schema.validate(request.body);
  if (error) return next(error);
  next();
};

module.exports.loginValidate = (request, response, next) => {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    password: joi.string().trim().min(8).required(),
  });
  const { error } = schema.validate(request.body);
  if (error) return next(error);
  next();
};
