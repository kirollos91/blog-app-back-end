const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      minlength: 5,
      maxlength: 100,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://res.cloudinary.com/doc6pfmvv/image/upload/v1751215671/default_avatar_profile_os2kc8.png",
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Populate posts that belongs to this user when he/she get his/her profile
UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

module.exports = model("User", UserSchema);
