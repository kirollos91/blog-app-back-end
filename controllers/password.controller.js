const UserDB = require("../models/user.model");
const ApiErrorHandle = require("../utils/ApiErrorHandle");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const VerificationTokenDB = require("../models/VerificationToken");
const sendEmail = require("../utils/sendEmail");

/**-----------------------------------------------
 * @desc    Send Reset Password Link
 * @route   /api/password/reset-password-link
 * @method  POST
 * @access  public
 -----------------------------------------------*/
module.exports.sendResetPasswordLinkCtrl = asyncHandler(
  async (request, response, next) => {
    const {
      body: { email },
    } = request;

    // Get The User form DB by email
    const user = await UserDB.findOne({ email });
    if (!user)
      return next(
        new ApiErrorHandle("User with given email does not exist!", 404)
      );

    // Create VerificationToken
    let verificationToken = await VerificationTokenDB.findOne({
      userId: user._id,
    });
    if (!verificationToken) {
      verificationToken = new VerificationTokenDB({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      await verificationToken.save();
    }

    // Create link
    const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

    // Create HTML Template
    const htmlTemplate = `
    <a href="${link}">Click here to reset your password</a>
    `;

    // Sending Email
    await sendEmail(user.email, "Reset Password", htmlTemplate);

    // Send response to the clint
    response.status(200).json({
      message:
        "Password reset link sent to your email, Please check your email(inbox OR spam)",
    });
  }
);

/*==================================================================================================*/

/**-----------------------------------------------
 * @desc    Get Reset Password Link
 * @route   /api/password/reset-password/:userId/:token
 * @method  GET
 * @access  public
 -----------------------------------------------*/
module.exports.getResetPasswordLinkCtrl = asyncHandler(
  async (request, response, next) => {
    const {
      params: { userId, token },
    } = request;

    // Check if user Exist
    const user = await UserDB.findById(userId);
    if (!user) return next(new ApiErrorHandle("Invalid Link", 400));

    // Check if Token Exist
    const verificationToken = await VerificationTokenDB.findOne({
      userId,
      token,
    });
    if (!verificationToken)
      return next(new ApiErrorHandle("Invalid Link", 400));

    // Send response to the clint
    response.status(200).json({
      message: "Valid url",
    });
  }
);

/*==================================================================================================*/

/**-----------------------------------------------
 * @desc    Reset Password
 * @route   /api/password/reset-password/:userId/:token
 * @method  POST
 * @access  public
 -----------------------------------------------*/
module.exports.resetPasswordCtrl = asyncHandler(
  async (request, response, next) => {
    const {
      body: { password },
      params: { userId, token },
    } = request;
    // Check User
    const user = await UserDB.findById(userId);
    if (!user) return next(new ApiErrorHandle("Invalid Link", 400));

    // Check token
    const verificationToken = await VerificationTokenDB.findOne({
      userId,
      token,
    });
    if (!verificationToken)
      return next(new ApiErrorHandle("Invalid Link", 400));

    // Check if user Not Account Verified
    if (!user.isAccountVerified) {
      user.isAccountVerified = true;
    }

    // Bcrypt Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.save();

    // Remove verificationToken
    await VerificationTokenDB.findByIdAndDelete(verificationToken._id);

    // Send response to the clint
    response.status(200).json({
      message: "Password Reset Successfully, Please Login",
    });
  }
);
