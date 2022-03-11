const usersRouter = require("express").Router();

const User = require("../models/users/user");
const List = require("../models/users/list");

usersRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id).select(
    "fullName avatar backdrop intro gender"
  );
  response.json(user);
});

usersRouter.get("/:id/reviews", async (request, response) => {
  const reviews = await User.findById(request.params.id).select("reviews");
  response.json(reviews);
});

usersRouter.get("/:id/lists", async (request, response) => {
  const lists = await List.find({ user: request.params.id })
    .select("title author lastModified backdrop description")
    .sort({
      lastModified: -1,
    });
  response.json(lists);
});

usersRouter.get("/:id/watchlist", async (request, response) => {
  const watchlist = await User.findById(request.params.id).select("watchlist");
  response.json(watchlist);
});

usersRouter.get("/:id/following", async (request, response) => {
  const watchlist = await User.findById(request.params.id).select("following");
  response.json(watchlist);
});

usersRouter.get("/:id/followers", async (request, response) => {
  const watchlist = await User.findById(request.params.id).select("followers");
  response.json(watchlist);
});

module.exports = usersRouter;
