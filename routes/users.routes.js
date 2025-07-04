const router = require("express").Router();
const {
  getAllUsersProfile,
  getUserProfile,
  updateUserProfile,
  getUserCount,
  profilePhotoUpload,
  deleteUserProfile,
} = require("../controllers/users.controller");
const {
  checkUserProfileId,
  updateUserProfileValidate,
} = require("../utils/validation/users.validate");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndUserHimself,
  verifyTokenAdminAndUserHimself,
} = require("../middlewares/tokenHandle");

const photoUpload = require("../middlewares/uploadPhotoHandle");

/**
 * @route /api/users/profile/
 */
router.route("/profile").get(verifyTokenAndAdmin, getAllUsersProfile);

router
  .route("/profile/:id")
  .get(checkUserProfileId, getUserProfile)
  .put(
    checkUserProfileId,
    verifyTokenAndUserHimself,
    updateUserProfileValidate,
    updateUserProfile
  )
  .delete(
    checkUserProfileId,
    verifyTokenAdminAndUserHimself,
    deleteUserProfile
  );

/**
 * @route /api/users/profile/profile-photo-update
 */
router.post(
  "/profile/profile-photo-upload",
  verifyToken,
  photoUpload.single("image"),
  profilePhotoUpload
);

/**
 * @route /api/users/count/
 */
router.get("/count", verifyTokenAndAdmin, getUserCount);

module.exports = router;
