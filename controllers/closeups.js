const closeupsRouter = require("express").Router();

// models
const CloseUp = require("../models/admin/closeup");

// middlewares
const middleware = require("../utils/middleware");

// get Close-Up post by series
closeupsRouter.get(
  "/series/:name",
  middleware.queryCloseUp,
  middleware.pagination(CloseUp),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

// get Close-Up post by author
closeupsRouter.get(
  "/author/:name",
  middleware.queryCloseUp,
  middleware.pagination(CloseUp),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

closeupsRouter.get("/:id", async (request, response) => {
  const post = await CloseUp.findById(request.params.id).populate("films", {
    title: 1,
    director: 1,
    backdrop: 1,
    year: 1,
  });
  response.json(post);
});

// post to Close-Up - RESERVED FOR ADMIN ONLY
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
