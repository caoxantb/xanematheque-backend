const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const closeupSchema = new mongoose.Schema({
  title: String,
  author: String,
  series: String,
  lastModified: Date,
  description: String,
  content: String,
  films: [
    {
      type: Number,
      ref: "Film",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followerCount: Number,
  discussions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
  ],
});

schemaTransform(closeupSchema);

module.exports = mongoose.model("CloseUp", closeupSchema);
