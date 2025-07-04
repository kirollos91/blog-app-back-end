const joi = require("joi");
const { isValidObjectId } = require("mongoose");

/**------------------------------
 * @desc Validate ID
 ------------------------------*/
module.exports.checkValidID = (request, _, next) => {
  if (!isValidObjectId(request.params.id))
    return next(new Error("invalid id", { cause: "mongoose invalid id" }));
  next();
};

/**------------------------------
 * @desc Validate Create New Comment
 ------------------------------*/
module.exports.createCommentValidate = (request, _, next) => {
  try {
    const schema = joi.object({
      postId: joi.string().required().label("Post ID"),
      text: joi.string().trim().required().label("Text"),
    });

    const { error } = schema.validate(request.body);
    if (error) return next(error);

    next();
  } catch (error) {
    next(error);
  }
};

/**------------------------------
 * @desc Validate Update Comment
 ------------------------------*/
module.exports.updateCommentValidate = (request, _, next) => {
  try {
    const schema = joi.object({
      text: joi.string().trim().required().label("Text"),
    });

    const { error } = schema.validate(request.body);
    if (error) return next(error);

    next();
  } catch (error) {
    next(error);
  }
};
