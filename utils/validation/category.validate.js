const joi = require("joi");
const { isValidObjectId } = require("mongoose");

module.exports.checkValidateID = (request, _, next) => {
  try {
    const { id } = request.params;
    if (!isValidObjectId(id))
      return next(new Error("Invalid ID", { cause: "mongoose invalid id" }));

    next();
  } catch (error) {
    next(error);
  }
};

/**---------------------------------------
 @desc  Validate Create New Category
---------------------------------------**/
module.exports.createCategoryValidate = (request, _, next) => {
  try {
    const schema = joi.object({
      title: joi.string().trim().required().label("Title"),
    });

    const { error } = schema.validate(request.body);
    if (error) return next(error);

    next();
  } catch (error) {
    next(error);
  }
};
