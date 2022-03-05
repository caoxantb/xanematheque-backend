const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const discussionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: String,
  lastModified: new Date("<YYYY-mm-dd>"),
  upvote: Number,
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
  ],
});

schemaTransform(discussionSchema);

module.exports = mongoose.model("Discussion", discussionSchema);
