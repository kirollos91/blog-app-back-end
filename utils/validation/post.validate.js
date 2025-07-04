const joi = require("joi");
const { isValidObjectId } = require("mongoose");

module.exports.checkValidID = (request, _, next) => {
  if (!isValidObjectId(request.params.id))
    return next(new Error("invalid id", { cause: "mongoose invalid id" }));
  next();
};

/**------------------------------
 * @desc Validate Create New Post
 ------------------------------*/
module.exports.createPostValidate = (request, _, next) => {
  try {
    const schema = joi.object({
      title: joi.string().trim().min(2).max(200).required(),
      description: joi.string().trim().min(10).required(),
      category: joi.string().trim().required(),
    });
    const { error } = schema.validate(request.body);
    if (error) return next(error);
    next();
  } catch (error) {
    next(error);
  }
};

/**------------------------------
 * @desc Validate Update Post
 ------------------------------*/
module.exports.updatePostValidate = [
  this.checkValidID,
  (request, _, next) => {
    try {
      const schema = joi.object({
        title: joi.string().trim().min(2).max(200),
        description: joi.string().trim().min(10),
        category: joi.string().trim(),
      });
      const { error } = schema.validate(request.body);
      if (error) return next(error);
      next();
    } catch (error) {
      next(error);
    }
  },
];
