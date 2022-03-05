const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const filmMetaSchema = new mongoose.Schema({
  _id: Number,
  originalTitle: String,
  languages: [String],
  synopsis: String,
  tagline: String,
  media: [
    {
      trailer: String,
      preview: String,
      fullMovie: String,
    },
  ],
  poster: String,
  ratings: Number,
  preVoteCount: Number,
  postVoteCount: Number,
  ourTake: String,
  relatedFilm: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Film",
    },
  ],
});

schemaTransform(filmMetaSchema, false);

module.exports = mongoose.model("FilmMeta", filmMetaSchema);
