const listsRouter = require("express").Router();

// models
const List = require("../models/admin/list");

// middlewares
const middleware = require("../utils/middleware");

// get List by author
listsRouter.get(
  "/author/:name",
  middleware.queryCloseUp,
  middleware.pagination(List),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

listsRouter.get("/:id", async (request, response) => {
  const list = await List.findById(request.params.id);
  response.json(list);
});

module.exports = listsRouter;
