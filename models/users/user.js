const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: String,
  fullName: { type: String, required: true },
  avatar: String,
  backdrop: String,
  intro: String,
  gender: Number,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  watchlist: [
    {
      type: Number,
      ref: "Film",
    },
  ],
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

schemaTransform(userSchema);

module.exports = mongoose.model("User", userSchema);
