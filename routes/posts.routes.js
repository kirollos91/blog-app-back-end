const router = require("express").Router();

const { verifyToken } = require("../middlewares/tokenHandle");

const photoUpload = require("../middlewares/uploadPhotoHandle");

const {
  getAllPosts,
  getPost,
  createNewPost,
  updatePost,
  updatePostImage,
  deletePost,
  getPostsCount,
  toggleLike,
} = require("../controllers/posts.controller");

const {
  checkValidID,
  createPostValidate,
  updatePostValidate,
} = require("../utils/validation/post.validate");

/**------------------------------
 * @route /api/posts/count 
 ------------------------------*/
router.get("/count", getPostsCount);

/**------------------------------
 * @route /api/posts/upload-image/:id 
 ------------------------------*/
router.put(
  "/upload-image/:id",
  checkValidID,
  verifyToken,
  photoUpload.single("image"),
  updatePostImage
);

/**------------------------------
 * @route /api/posts/like/:id 
 ------------------------------*/
router.put("/like/:id", checkValidID, verifyToken, toggleLike);

/**------------------------------
 * @route /api/posts 
 ------------------------------*/
router
  .route("/")
  .get(getAllPosts)
  .post(
    verifyToken,
    photoUpload.single("image"),
    createPostValidate,
    createNewPost
  );

/**------------------------------
 * @route /api/posts/:id 
 ------------------------------*/
router
  .route("/:id")
  .get(checkValidID, getPost)
  .put(checkValidID, verifyToken, updatePostValidate, updatePost)
  .delete(checkValidID, verifyToken, deletePost);

module.exports = router;
