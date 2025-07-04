const { Schema, model } = require("mongoose");

const CommentSchema = new Schema(
  {
    postId: {
      type: Schema.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Comment", CommentSchema);
