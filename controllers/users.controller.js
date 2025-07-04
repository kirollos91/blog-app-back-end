const UserDB = require("../models/user.model");
const CommentDB = require("../models/comment.model");
const PostDB = require("../models/post.model");
const ApiErrorHandle = require("../utils/ApiErrorHandle");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const path = require("node:path");
const fs = require("node:fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
} = require("../utils/cloudinary");

/**--------------------------------------
 * @desc    Get All Users Profile
 * @route   /api/users/profile
 * @method  GET
 * @access  private (only admin)
 --------------------------------------*/
module.exports.getAllUsersProfile = asyncHandler(
  async (request, response, next) => {
    // Get users profile
    const users = await UserDB.find().select("-password").populate("posts");

    // Send response to client
    response
      .status(200)
      .json({ message: "get list of users successfully", users });
  }
);

/**--------------------------------------
 * @desc    Get User Profile
 * @route   /api/users/profile/:id
 * @method  GET
 * @access  public
 --------------------------------------*/
module.exports.getUserProfile = asyncHandler(
  async (request, response, next) => {
    const { id } = request.params;
    // Get user profile
    const user = await UserDB.findById(id)
      .select("-password")
      .populate("posts");
    if (!user) return next(new ApiErrorHandle("user not found", 404));

    // Send response to client
    response.status(200).json({ message: "get user data successfully", user });
  }
);

/**--------------------------------------
 * @desc    Update User Profile
 * @route   /api/users/profile/:id
 * @method  PUT
 * @access  private (only user himself)
 --------------------------------------*/

module.exports.updateUserProfile = asyncHandler(
  async (request, response, next) => {
    let { username, password, bio } = request.body;
    const { id } = request.params;
    // Hash password
    if (password) {
      const salt = await bcrypt.generateSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    const user = await UserDB.findByIdAndUpdate(
      id,
      {
        $set: { username, password, bio },
      },
      { new: true }
    )
      .select("-password")
      .populate("posts");

    // Sent response to client
    response.status(200).json({ message: "update user successfully", user });
  }
);

/**--------------------------------------
 * @desc    Get Users Count
 * @route   /api/users/count
 * @method  GET
 * @access  private (only admin)
 --------------------------------------*/
module.exports.getUserCount = asyncHandler(async (_, response) => {
  const usersCount = await UserDB.countDocuments();
  response.status(200).json({ message: "count of all users", usersCount });
});

/**--------------------------------------
 * @desc    Profile Photo Upload
 * @route   /api/users/profile/profile-photo-upload
 * @method  POST
 * @access  private (only logged in user)
 --------------------------------------*/
module.exports.profilePhotoUpload = asyncHandler(
  async (request, response, next) => {
    // check if photo is exists
    if (!request.file) return next(new ApiErrorHandle("no file provided", 400));

    // Get the path to the image
    const imagePath = path.join(
      __dirname,
      `../images/profiles/${request.file.filename}`
    );

    // Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    // console.log(result);
    // get the user from DB
    const user = await UserDB.findById(request.user.id);

    // Delete the old profile photo if exists
    if (user.profilePhoto.publicId !== null) {
      await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    // Change the profile photo field in the DB
    user.profilePhoto = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    await user.save();

    // Sent response to client
    response.status(200).json({
      message: "your profile photo uploaded successfully",
      profilePhoto: { url: result.secure_url, publicId: result.public_id },
    });

    // Remove image form the server
    fs.unlinkSync(imagePath);
  }
);

/**--------------------------------------
 * @desc    Delete user profile (Account)
 * @route   /api/users/profile/:id
 * @method  DELETE
 * @access  private (only admin or user himself)
 --------------------------------------*/
module.exports.deleteUserProfile = asyncHandler(
  async (request, response, next) => {
    const { id } = request.params;
    // Get user form DB
    const user = await UserDB.findById(id);
    if (!user) return next(new ApiErrorHandle("user not found", 404));

    // Get all posts from DB
    const posts = await PostDB.find({ user: user._id });

    // Get the public ids from the posts
    const publicIds = posts?.map((post) => post.image.publicId);

    // Delete all posts image from cloudinary that belong to this user
    if (publicIds?.length > 0) await cloudinaryRemoveMultipleImage(publicIds);

    // Delete the profile picture from cloudinary
    if (user.profilePhoto.publicId)
      await cloudinaryRemoveImage(user.profilePhoto.publicId);

    // Delete user posts & comments
    await PostDB.deleteMany({ user: user._id });
    await CommentDB.deleteMany({ user: user._id });

    // Delete user himself
    await UserDB.findByIdAndDelete(id);

    // Send response to client
    response
      .status(200)
      .json({ message: "your profile has been deleted successfully" });
  }
);
