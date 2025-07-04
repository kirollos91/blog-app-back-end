const joi = require("joi");
const { isValidObjectId } = require("mongoose");
const passwordComplexity = require("joi-password-complexity");

module.exports.checkUserProfileId = (request, _, next) => {
  const { id } = request.params;
  if (!isValidObjectId(id))
    return next(new Error("invalid id", { cause: "mongoose invalid id" }));
  next();
};

module.exports.updateUserProfileValidate = (request, _, next) => {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(100),
    password: passwordComplexity(),
    bio: joi.string().trim(),
  });

  const { error } = schema.validate(request.body);
  if (error) return next(error);
  next();
};
