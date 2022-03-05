const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const notebookSchema = new mongoose.Schema({
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  lastModified: Date,
  backdrop: String,
  description: String,
  content: String,
  films: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Film",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followersNumber: Number,
  discussions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
  ],
});

schemaTransform(notebookSchema);

module.exports = mongoose.model("Notebook", notebookSchema);
