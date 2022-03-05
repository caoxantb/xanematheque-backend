const mongoose = require("mongoose");
const { schemaTransform } = require("../../utils/helper");

const personSchema = new mongoose.Schema({
  id: Number,
  profilePicture: String,
  fullName: String,
});

schemaTransform(personSchema, false);

module.exports = mongoose.model("Person", personSchema);
