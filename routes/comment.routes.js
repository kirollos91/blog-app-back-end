const router = require("express").Router();
const {
  getAllCommentsCtrl,
  createCommentCtrl,
  updateCommentByIdCtrl,
  deleteCommentByIdCtrl,
} = require("../controllers/comments.controller");

const {
  checkValidID,
  createCommentValidate,
  updateCommentValidate,
} = require("../utils/validation/Comments.Validate");

const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/tokenHandle");

/**------------------------
 * @route /api/comments
------------------------**/
router
  .route("/")
  .get(verifyTokenAndAdmin, getAllCommentsCtrl)
  .post(verifyToken, createCommentValidate, createCommentCtrl);

/**------------------------
 * @route /api/comments/:id
------------------------**/
router
  .route("/:id")
  .put(checkValidID, verifyToken, updateCommentValidate, updateCommentByIdCtrl)
  .delete(checkValidID, verifyToken, deleteCommentByIdCtrl);

module.exports = router;
