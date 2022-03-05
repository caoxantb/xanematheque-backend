const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const personMetaSchema = new mongoose.Schema({
  id: Number,
  birthyear: Number,
  deathyear: Number,
  biography: String,
  gender: Number,
  castCredits: [
    {
      character: String,
      film: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Film",
      },
    },
  ],
  crewCredits: [
    {
      department: String,
      job: String,
      film: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Film",
      },
    },
  ],
});

schemaTransform(personMetaSchema, false);

module.exports = mongoose.model("PersonMeta", personMetaSchema);
