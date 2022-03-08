const closeupsRouter = require("express").Router();

// models
const CloseUp = require("../models/closeups/closeup");

// middlewares
const middleware = require("../utils/middleware");

closeupsRouter.get(
  "/series/:name",
  middleware.queryCloseUp,
  middleware.pagination(CloseUp),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

closeupsRouter.get(
  "/author/:name",
  middleware.queryCloseUp,
  middleware.pagination(CloseUp),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);
closeupsRouter.get("/:id", async (request, response) => {
  const post = CloseUp.findById({ id: request.params.id });
  response.json(post);
});

closeupsRouter.post("/", async (request, response) => {
  const body = request.body;

  const post = new CloseUp({
    title: body.title,
    author: body.author,
    series: body.series,
    lastModified: new Date().toLocaleDateString(),
    description: body.description,
    content: body.content,
    films: body.films,
    followers: [],
    followerCount: 0,
    discussions: [],
  });

  const savedPost = await post.save();

  response.status(201).json(savedPost);
});

module.exports = closeupsRouter;
