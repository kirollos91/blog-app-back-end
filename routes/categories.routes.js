const router = require("express").Router();

const {
  getAllCategoriesCtrl,
  createCategoryCtrl,
  deleteCategoryCtrl,
} = require("../controllers/categories.controller");

const {
  checkValidateID,
  createCategoryValidate,
} = require("../utils/validation/category.validate");

const { verifyTokenAndAdmin } = require("../middlewares/tokenHandle");

/**--------------------
 * @route /api/categories/ 
--------------------**/
router
  .route("/")
  .get(getAllCategoriesCtrl)
  .post(verifyTokenAndAdmin, createCategoryValidate, createCategoryCtrl);

/**--------------------
 * @route /api/categories/ 
--------------------**/
router
  .route("/:id")
  .delete(checkValidateID, verifyTokenAndAdmin, deleteCategoryCtrl);

module.exports = router;
