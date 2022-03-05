const schemaTransform = (schema, idToString = true) => {
  schema.set("toJSON", {
    transform: (document, returnedObject) => {
      returnedObject.id = !idToString
        ? returnedObject._id
        : returnedObject._id.ToString();
      delete returnedObject._id;
      delete returnedObject.__v;
    },
  });
};

module.exports = {
  schemaTransform,
};
