const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const filmSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  director: [
    {
      _id: Number,
      name: String,
      profilePicture: String,
    },
  ],
  year: Number,
  countries: [String],
  duration: Number,
  genres: [String],
  backdrop: String,
  averageRating: Number,
  nowShowing: { type: Boolean, default: false },
});

schemaTransform(filmSchema, false);

module.exports = mongoose.model("Film", filmSchema);
