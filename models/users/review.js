const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  lastModified: Date,
  content: String,
  rating: Number,
  film: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Film",
  },
  votes: Number,
  discussions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
  ],
});

schemaTransform(reviewSchema);

module.exports = mongoose.model("Review", reviewSchema);
