const { Schema, model } = require("mongoose");

const VerificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("VerificationToken", VerificationTokenSchema);
