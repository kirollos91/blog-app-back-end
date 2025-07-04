const router = require("express").Router();
const {
  register,
  login,
  verifyUserAccount,
} = require("../controllers/auth.controller");

const {
  registerValidate,
  loginValidate,
} = require("../utils/validation/auth.validate");

/**
 * @route /api/auth
 */

router.post("/register", registerValidate, register);
router.post("/login", loginValidate, login);

/**
 * @route /api/auth/:userId/verify/:token
 */
router.get("/:userId/verify/:token", verifyUserAccount);

module.exports = router;
