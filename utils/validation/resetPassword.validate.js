const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

/**
 * @desc Forgot & Reset Password
 */

module.exports.emailValidate = (request, _, next) => {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
  });
  const { error } = schema.validate(request.body);
  if (error) return next(error);
  next();
};

module.exports.newPasswordValidate = (request, _, next) => {
  const schema = joi.object({
    password: passwordComplexity().required(),
  });
  const { error } = schema.validate(request.body);
  if (error) return next(error);
  next();
};
