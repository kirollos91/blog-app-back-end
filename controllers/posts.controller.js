const PostDB = require("../models/post.model");
const CommentDB = require("../models/comment.model");
const ApiErrorHandle = require("../utils/ApiErrorHandle");
const asyncHandler = require("express-async-handler");
const fs = require("node:fs");
const path = require("node:path");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

/**------------------------------
 * @desc    Get Posts Count
 * @route   /api/posts/count
 * @method  GET
 * @access  public
 ------------------------------*/
module.exports.getPostsCount = asyncHandler(async (request, response) => {
  const count = await PostDB.countDocuments();

  // Sent response to the client
  response.status(200).json({ message: "get posts count successfully", count });
});

/**------------------------------
 * @desc    Get All Posts
 * @route   /api/posts
 * @method  GET
 * @access  public
 ------------------------------*/
module.exports.getAllPosts = asyncHandler(async (request, response, next) => {
  let { page, category } = request.query;
  let limit = 3;
  let skip = (page - 1) * limit;

  if (!page) {
    limit = {};
    skip = 0;
  }

  const posts = await PostDB.find(category ? { category } : {})
    .limit(limit)
    .skip(skip)
    .populate({ path: "user", select: "-password -__v" })
    .sort({ createdAt: -1 });

  // // if not found any posts
  // if (posts?.length < 1 || !posts)
  //   return next(new ApiErrorHandle("not found any post", 404));

  // Sent response to the client
  response
    .status(200)
    .json({ message: "get all posts successfully", data: posts });
});

/**------------------------------
 * @desc    Get Post By Id
 * @route   /api/posts/:id
 * @method  GET
 * @access  public
 ------------------------------*/
module.exports.getPost = asyncHandler(async (request, response, next) => {
  // Get Post
  const post = await PostDB.findById(request.params.id)
    .populate({
      path: "user",
      select: "-password -__v",
    })
    .populate({ path: "comments" });

  if (!post) return next(new ApiErrorHandle("post not found", 404));

  // Sent response to the client
  response.status(200).json({ message: "get post successfully", data: post });
});

/**------------------------------
 * @desc    Create New Post
 * @route   /api/posts
 * @method  POST
 * @access  private (only logged in user)
 ------------------------------*/
module.exports.createNewPost = asyncHandler(async (request, response, next) => {
  // check if photo is exists
  if (!request.file) return next(new ApiErrorHandle("no file provided", 400));

  // Update photo
  const imagePath = path.join(
    __dirname,
    `../images/profiles/${request.file.filename}`
  );
  const result = await cloudinaryUploadImage(imagePath);

  // Create new post and save it to DB
  const { title, description, category } = request.body;
  const post = await PostDB.create({
    title,
    description,
    category,
    user: request.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // Sent response to the client
  response
    .status(201)
    .json({ message: "create new post successfully", data: post });

  // Remove image from the server
  fs.unlinkSync(imagePath);
});

/**------------------------------
 * @desc    Update Post By Id
 * @route   /api/posts/:id
 * @method  PUI
 * @access  private (only user created the post)
 ------------------------------*/
module.exports.updatePost = asyncHandler(async (request, response, next) => {
  const { id } = request.params;

  // Get post data
  const post = await PostDB.findById(id);
  if (!post) return next(new ApiErrorHandle("post not found", 404));

  // Check if this user he is create this post
  if (post.user._id.toString() !== request.user.id)
    return next(new ApiErrorHandle("access denied, you art not allowed", 403));

  // Update data
  const { title, description, category } = request.body;
  const updatePost = await PostDB.findByIdAndUpdate(
    id,
    {
      $set: { title, description, category },
    },
    { new: true }
  )
    .populate("user", ["-password -__v"])
    .populate("comments");

  // Sent response to the client
  response
    .status(200)
    .json({ message: "updated post successfully", data: updatePost });
});

/**------------------------------
 * @desc    Update Post Image By Id
 * @route   /api/posts/upload-image/:id
 * @method  PUT
 * @access  private (only user created the post)
 ------------------------------*/
module.exports.updatePostImage = asyncHandler(
  async (request, response, next) => {
    const { id } = request.params;

    // Check if image exists
    if (!request.file)
      return next(new ApiErrorHandle("no image provided", 400));

    // Get post data
    const post = await PostDB.findById(id);

    if (!post) return next(new ApiErrorHandle("post not found", 404));

    // Check if this user he is create this post
    if (post.user._id.toString() !== request.user.id)
      return next(
        new ApiErrorHandle("access denied, you art not allowed", 403)
      );

    // Delete old image
    await cloudinaryRemoveImage(post.image.publicId);

    // Upload new image
    const imagePath = path.join(
      __dirname,
      `../images/profiles/${request.file.filename}`
    );
    const result = await cloudinaryUploadImage(imagePath);

    // Update post image in DB
    const updatePost = await PostDB.findByIdAndUpdate(
      id,
      {
        $set: {
          image: {
            url: result.secure_url,
            publicId: result.public_id,
          },
        },
      },
      { new: true }
    );

    // Sent response to the client
    response
      .status(200)
      .json({ message: "updated post successfully", data: updatePost });

    // Remove image from server
    fs.unlinkSync(imagePath);
  }
);

/**------------------------------
 * @desc    Delete Post By Id
 * @route   /api/posts/:id
 * @method  DELETE
 * @access  private (only admin or user created the post)
 ------------------------------*/
module.exports.deletePost = asyncHandler(async (request, response, next) => {
  const { id } = request.params;

  // Get post data
  const post = await PostDB.findById(id);
  if (!post) return next(new ApiErrorHandle("post not found", 404));

  // Check if user is admin or He create the post
  if (post.user._id.toString() !== request.user.id && !request.user.isAdmin)
    return next(new ApiErrorHandle("access denied, forbidden", 403));

  // Remove post by id
  await PostDB.findByIdAndDelete(id);

  // Remove image from cloudinary
  await cloudinaryRemoveImage(post.image.publicId);

  // Delete comments that belong to this post
  await CommentDB.deleteMany({ postId: post._id });

  // Send response to the client
  response
    .status(200)
    .json({ message: "Post has been deleted successfully", postID: id });
});

/**------------------------------
 * @desc    Toggle Like
 * @route   /api/posts/like/:id
 * @method  PUT
 * @access  private (only logged in user)
 ------------------------------*/
module.exports.toggleLike = asyncHandler(async (request, response, next) => {
  const { id: postID } = request.params;
  let post = await PostDB.findById(postID);
  if (!post) return next(new ApiErrorHandle("post not found", 404));

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === request.user.id
  );

  if (isPostAlreadyLiked) {
    post = await PostDB.findByIdAndUpdate(
      postID,
      {
        $pull: { likes: request.user.id },
      },
      { new: true }
    );
  } else {
    post = await PostDB.findByIdAndUpdate(
      postID,
      {
        $push: { likes: request.user.id },
      },
      { new: true }
    );
  }

  // Sent response to client
  response.status(200).json({ message: "toggle likes successfully", post });
});
