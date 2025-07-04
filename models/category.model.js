const { Schema, model } = require("mongoose");

const CategorySchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Category", CategorySchema);
