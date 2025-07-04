const CommentDB = require("../models/comment.model");
const PostDB = require("../models/post.model");
const ApiErrorHandle = require("../utils/ApiErrorHandle");
const asyncHandler = require("express-async-handler");

/**----------------------------------------------
 * @desc    Get List Of Comments
 * @route   /api/comments
 * @method  GET
 * @access  private (only admin)
 ----------------------------------------------**/
module.exports.getAllCommentsCtrl = asyncHandler(async (_, response) => {
  // get all comments from db
  const comments = await CommentDB.find().populate("user");

  // set response to the client
  response
    .status(200)
    .json({ message: "get all comments successfully", data: comments });
});

/**----------------------------------------------
 * @desc    Create New Comment
 * @route   /api/comments
 * @method  POST
 * @access  private (Only logged in user)
 ----------------------------------------------**/
module.exports.createCommentCtrl = asyncHandler(async (request, response) => {
  // Get data from client in body
  const { postId, text } = request.body;

  // Create New Comment
  const comment = await CommentDB.create({
    postId,
    text,
    user: request.user.id,
    username: request.user.username,
  });

  // Sent response to the client
  response
    .status(201)
    .json({ message: "Create new message Successfully", data: comment });
});

/**----------------------------------------------
 * @desc    Update Comment BY Id
 * @route   /api/comments/:id
 * @method  PUT
 * @access  private (Only owner of the comment)
 ----------------------------------------------**/
module.exports.updateCommentByIdCtrl = asyncHandler(
  async (request, response, next) => {
    const { text } = request.body;
    const { id } = request.params;

    // check if comment exist
    const comment = await CommentDB.findById(id);
    if (!comment) return next(new ApiErrorHandle("comment not found", 404));

    // check if user is owner of comment
    if (request.user.id !== comment.user.toString())
      return next(
        new ApiErrorHandle(
          "access denied, only himself can edit his comment",
          403
        )
      );

    // update comment
    const updateComment = await CommentDB.findByIdAndUpdate(
      id,
      { text },
      { new: true }
    );

    // Sent response to the client
    response
      .status(200)
      .json({ message: "updated message successfully", data: updateComment });
  }
);

/**----------------------------------------------
 * @desc    Delete Comment By Id
 * @route   /api/comments/:id
 * @method  DELETE
 * @access  private (admin or owner of the comment or owner of the post)
 ----------------------------------------------**/
module.exports.deleteCommentByIdCtrl = asyncHandler(
  async (request, response, next) => {
    // get id form params
    const { id } = request.params;

    // check if comment exist in db or not
    const comment = await CommentDB.findById(id);
    if (!comment) return next(new ApiErrorHandle("comment not found", 404));

    // get owner of the post
    const post = await PostDB.findById(comment.postId);

    // check if this admin or user own this comment or user own the post
    if (
      !request.user.isAdmin &&
      request.user.id !== comment.user.toString() &&
      request.user.id !== post.user.toString()
    )
      return next(new ApiErrorHandle("access denied, not allow", 403));

    // deleted comment
    await CommentDB.findByIdAndDelete(id);

    // sent response to the client
    response.status(200).json({ message: "deleted message successfully" });
  }
);
