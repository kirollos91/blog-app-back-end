const UserDB = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const ApiErrorHandle = require("../utils/ApiErrorHandle");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const { generateToken } = require("../utils/generateToken");
const VerificationTokenDB = require("../models/VerificationToken");
const sendEmail = require("../utils/sendEmail");

/**--------------------------------------
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 --------------------------------------*/
module.exports.register = asyncHandler(async (request, response, next) => {
  let { username, password, email } = request.body;
  // Check if user exists before or not
  const user = await UserDB.findOne({ email });
  if (user) return next(new ApiErrorHandle("user already exists", 400));

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  // New user and save it to database
  const newUser = new UserDB({
    username,
    password,
    email,
  });
  await newUser.save();

  // Create New VerificationToken & save it to DB
  const verificationToken = new VerificationTokenDB({
    userId: newUser._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await verificationToken.save();

  // Making the link
  const link = `${process.env.CLIENT_DOMAIN}/users/${verificationToken.userId}/verify/${verificationToken.token}`;

  // Putting the link into an html template
  const htmlTemplate = `
  <div>
    <p>Click on the link below to verify your email</p>
    <a href="${link}">Verify</a>
  </div>
  `;

  // Sending email to the user
  await sendEmail(newUser.email, "Verify Your Email", htmlTemplate);

  // Send response to client
  response.status(201).json({
    message:
      "We sent to you an email in (inbox OR spam), please verify your email address",
  });
});

/**--------------------------------------
 * @desc    Login User
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 --------------------------------------*/
module.exports.login = asyncHandler(async (request, response, next) => {
  let { email, password } = request.body;

  // Check if user exists before or not
  const user = await UserDB.findOne({ email });
  if (!user) return next(new ApiErrorHandle("invalid email or password", 400));

  // Compare the password with database password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch)
    return next(new ApiErrorHandle("invalid email or password", 400));

  // Check if user verify email
  if (!user.isAccountVerified) {
    let verificationToken = await VerificationTokenDB.findOne({
      userId: user._id,
    });

    if (!verificationToken) {
      verificationToken = new VerificationTokenDB({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
    }

    await verificationToken.save();

    // Making the link
    const link = `${process.env.CLIENT_DOMAIN}/users/${verificationToken.userId}/verify/${verificationToken.token}`;

    // Putting the link into an html template
    const htmlTemplate = `
    <div>
      <p>Click on the link below to verify your email</p>
      <a href="${link}">Verify</a>
    </div>
    `;

    // Sending email to the user
    await sendEmail(newUser.email, "Verify Your Email", htmlTemplate);

    return response.status(400).json({
      message:
        "We sent to you an email in (inbox OR spam), please verify your email address",
    });
  }

  // generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    isAdmin: user.isAdmin,
  });
  // Sent response to client
  response.status(200).json({
    message: "login successfully",
    user: {
      _id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      profilePhoto: user.profilePhoto,
      token,
    },
  });
});

/**--------------------------------------
 * @desc    Verify User Account
 * @route   /api/auth/:userId/verify/:token
 * @method  GET
 * @access  public
 --------------------------------------*/
module.exports.verifyUserAccount = asyncHandler(
  async (request, response, next) => {
    const {
      params: { userId, token },
    } = request;

    // Check user id
    const user = await UserDB.findById(userId);
    if (!user) return next(new ApiErrorHandle("invalid link", 400));

    // Check Token
    const verificationToken = await VerificationTokenDB.findOne({
      token,
      userId,
    });
    if (!verificationToken)
      return next(new ApiErrorHandle("invalid link", 400));

    console.log(verificationToken);

    // Update account verified
    user.isAccountVerified = true;
    await user.save();

    // Remover verification From database
    await VerificationTokenDB.findByIdAndDelete(verificationToken._id);

    // Sent Response to the client
    response.status(200).json({ message: "Your account verified" });
  }
);
