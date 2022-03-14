const usersRouter = require("express").Router();

const User = require("../models/users/user");
const List = require("../models/admin/list");
const CloseUp = require("../models/admin/closeup");

usersRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id).select(
    "fullName avatar backdrop intro gender"
  );
  response.json(user);
});

// get reviews
usersRouter.get("/:id/reviews", async (request, response) => {
  const reviews = await User.findById(request.params.id).select("reviews");
  response.json(reviews);
});

// get lists
usersRouter.get("/:id/lists", async (request, response) => {
  const lists = await List.find({ followers: request.params.id })
    .select("title lastModified backdrop description")
    .sort({
      lastModified: -1,
    });
  response.json(lists);
});

// follow/unfollow a list
usersRouter.put("/:id/closeups", async (request, response) => {
  const list = await List.findById(request.body.list);
  const user = await User.findById(request.params.id);

  if (request.query.action === "follow") {
    list.followers = list.followers.concat(user);
    list.followerCount += 1;
    await list.save();
  } else if (request.query.action === "unfollow") {
    list.followers = list.followers.filter(
      (u) => u.toString() !== request.params.id
    );
    list.followerCount -= 1;
    await list.save();
  }

  response.json();
});

// get closeups
usersRouter.get("/:id/closeups", async (request, response) => {
  const closeup = await CloseUp.find({ followers: request.params.id })
    .select("title lastModified backdrop description")
    .sort({
      lastModified: -1,
    });
  response.json(closeup);
});

// follow/unfollow a closeup
usersRouter.put("/:id/closeups", async (request, response) => {
  const closeup = await CloseUp.findById(request.body.closeup);
  const user = await User.findById(request.params.id);

  if (request.query.action === "follow") {
    closeup.followers = closeup.followers.concat(user);
    closeup.followerCount += 1;
    await closeup.save();
  } else if (request.query.action === "unfollow") {
    closeup.followers = closeup.followers.filter(
      (u) => u.toString() !== request.params.id
    );
    closeup.followerCount -= 1;
    await closeup.save();
  }

  response.json();
});

// get watchlist - need to further populate
usersRouter.get("/:id/watchlist", async (request, response) => {
  const watchlist = await User.findById(request.params.id).select("watchlist");
  response.json(watchlist);
});

usersRouter.put("/:id/watchlist", async (request, response) => {
  const user = await User.findById(request.params.id);

  if (request.query.action === "add") {
    user.watchlist = user.watchlist.concat(request.body.film);
    await user.save();
  }

  if (request.query.action === "remove") {
    user.watchlist = user.watchlist.filter((f) => f !== request.body.film);
    await user.save();
  }

  response.json();
});

// get following list - need to further populate
usersRouter.get("/:id/following", async (request, response) => {
  const following = await User.findById(request.params.id).select("following");
  response.json(following);
});

// get followers list - need to further populate
usersRouter.get("/:id/followers", async (request, response) => {
  const followers = await User.findById(request.params.id).select("followers");
  response.json(followers);
});

// add and remove followers/following
usersRouter.put("/:id/following", async (request, response) => {
  const userFollowing = await User.findById(request.params.id);
  const userFollowed = await User.findById(request.body.user);

  if (request.query.action === "add") {
    userFollowing.following = userFollowing.following.concat(userFollowed);
    await userFollowing.save();

    userFollowed.followers = userFollowed.followers.concat(userFollowing);
    await userFollowed.save();
  } else if (request.query.action === "remove") {
    userFollowing.following = userFollowing.following.filter(
      (u) => u.toString() !== request.body.user
    );
    await userFollowing.save();

    userFollowed.followers = userFollowed.followers.filter(
      (u) => u.toString() !== request.params.id
    );
    await userFollowed.save();
  }

  response.json(userFollowing);
});

module.exports = usersRouter;
