const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const listSchema = new mongoose.Schema({
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  lastModified: Date,
  backdrop: String,
  description: String,
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

schemaTransform(listSchema);

module.exports = mongoose.model("List", listSchema);
