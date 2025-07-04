const router = require("express").Router();
const {
  emailValidate,
  newPasswordValidate,
} = require("../utils/validation/resetPassword.validate");

const {
  getResetPasswordLinkCtrl,
  resetPasswordCtrl,
  sendResetPasswordLinkCtrl,
} = require("../controllers/password.controller");

/**
 * @route /api/password/reset-password-link
 */
router.route("/reset-password-link").post(sendResetPasswordLinkCtrl);

/**
 * @route /api/password/reset-password/:userId/:token
 */
router
  .route("/reset-password/:userId/:token")
  .get(getResetPasswordLinkCtrl)
  .post(resetPasswordCtrl);

module.exports = router;
