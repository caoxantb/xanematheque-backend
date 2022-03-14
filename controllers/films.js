const filmsRouter = require("express").Router();

// models
const Film = require("../models/films/film");
const FilmMeta = require("../models/films/filmMeta");
const List = require("../models/admin/list");
const CloseUp = require("../models/admin/closeup");
const Review = require("../models/users/review");

// middlewares
const middleware = require("../utils/middleware");
const tmdb = require("../utils/tmdb");

// get now showing films
filmsRouter.get("/nowshowing", async (request, response) => {
  const filmsNowShowing = await Film.find({ nowShowing: true });
  response.json(filmsNowShowing);
});

// browse films in the Closet
filmsRouter.get(
  "/closet",
  middleware.queryCloset,
  middleware.pagination(Film),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

// search films by text
filmsRouter.get(
  "/search",
  tmdb.searchTMDB("movie"),
  async (request, response) => {
    const resultFetched = response.result;
    const films = resultFetched.results.map((r) => Film.findById(r.id));
    const newResults = await Promise.all(films);
    resultFetched.results = newResults;

    response.json(resultFetched);
  }
);

// get film by id
filmsRouter.get(
  "/:id",
  tmdb.getFilmMeta,
  middleware.getCast,
  middleware.getShortCrew,
  async (request, response) => {
    const id = request.params.id;
    const resultFetched = response.result;
    const cast =
      response.cast.length > 6 ? response.cast.slice(0, 6) : response.cast;
    const crew = response.crew;

    const films = resultFetched.relatedFilms.map((r) =>
      Film.findById(r.id).select("title director.name year")
    );
    const newResults = await Promise.all(films);

    // const meta = await FilmMeta.findById(id);
    // const voteCount = resultFetched.voteCount + meta.voteCount;
    // const ratings =
    //   resultFetched.ratings * resultFetched.voteCount + meta.ratings;

    const lists = await List.find({ films: id })
      .sort({
        followerCount: -1,
      })
      .limit(6)
      .select("title author backdrop lastModified description");
    const closeups = await CloseUp.find({ films: id })
      .sort({
        followerCount: -1,
      })
      .limit(6)
      .select("title author series lastModified description");
    const reviews = await Review.find({ film: id })
      .sort({
        votes: -1,
      })
      .limit(12)
      .select("author rating content");

    const finalResult = {
      ...resultFetched,
      // media: meta.media,
      // ourTake: meta.ourTake,
      // ratings: ratings,
      // preVoteCount: resultFetched.voteCount,
      // postVoteCount: resultFetched.voteCount + meta.preVoteCount,
      cast: cast,
      crew: crew,
      lists: lists,
      closeups: closeups,
      reviews: reviews,
      relatedFilms: newResults,
    };

    response.json(finalResult);
  }
);

// get film credits
filmsRouter.get(
  "/:id/credits",
  tmdb.getFilmCredit,
  middleware.getCast,
  middleware.getCrew,
  async (request, response) => {
    const cast = response.cast;
    const crew = response.crew;
    const result = { cast: cast, ...crew };
    response.json(result);
  }
);

// get film lists
filmsRouter.get(
  "/:id/lists",
  middleware.queryListAndCloseUp,
  middleware.pagination(List),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

// get film closeups
filmsRouter.get(
  "/:id/closeups",
  middleware.queryListAndCloseUp,
  middleware.pagination(CloseUp),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

// get film reviews
filmsRouter.get(
  "/:id/reviews",
  middleware.queryReview,
  middleware.pagination(Review),
  async (request, response) => {
    response.json(response.paginatedResult);
  }
);

// post film review
filmsRouter.post(
  "/:id/reviews",
  middleware.userExtractor,
  async (request, response) => {
    const body = request.body;
    const user = request.user;
    const filmID = request.params.id;

    const review = new Review({
      author: user._id,
      lastModified: new Date().toLocaleDateString(),
      film: filmID,
      rating: body.rating,
      content: body.content,
      votes: 0,
      discussions: [],
    });

    const savedReview = await review.save();

    user.reviews = user.reviews.concat(savedReview._id);
    await user.save();

    const filmMeta = await FilmMeta.findById(filmID);
    filmMeta.ratings += body.rating;
    filmMeta.postVoteCount += 1;
    await filmMeta.save();

    const film = await Film.findById(filmID);
    film.averageRating =
      (film.averageRating * filmMeta.preVoteCount + filmMeta.ratings) /
      filmMeta.postVoteCount;
    await film.save();

    response.status(201).json(savedReview);
  }
);

//get one film review
filmsRouter.get("/:filmID/reviews/:reviewID", async (request, response) => {
  const review = Review.findById(request.params.reviewID);
  response.json(review);
});

// update film review
filmsRouter.put(
  "/:filmID/reviews/:reviewID",
  middleware.userExtractor,
  async (request, response) => {
    const body = request.body;
    const filmID = request.params.filmID;
    const reviewID = request.params.reviewID;

    const newReview = { rating: body.rating, content: body.content };

    const review = await Review.findById(reviewID);

    if (review.author.toString() !== request.decodedToken.id) {
      return response
        .status(403)
        .json({ error: "you are not authorized for this action" });
    }

    const filmMeta = await FilmMeta.findById(filmID);
    filmMeta.ratings += body.rating - review.rating;
    await filmMeta.save();

    const film = await Film.findById(filmID);
    film.averageRating =
      (film.averageRating * filmMeta.preVoteCount + filmMeta.ratings) /
      filmMeta.postVoteCount;
    await film.save();

    const updatedReview = await Review.findByIdAndUpdate(reviewID, newReview);

    response.json(updatedReview);
  }
);

// delete film review
filmsRouter.delete(
  "/:filmID/reviews/:reviewID",
  middleware.userExtractor,
  async (request, response) => {
    const filmID = request.params.filmID;
    const reviewID = request.params.reviewID;

    const review = await Review.findById(reviewID);

    if (review.author.toString() !== request.decodedToken.id) {
      return response
        .status(403)
        .json({ error: "you are not authorized for this action" });
    }

    const user = request.user;
    user.reviews = user.reviews.filter((r) => r.toString() !== reviewID);
    await user.save();

    const filmMeta = await FilmMeta.findById(filmID);
    filmMeta.ratings -= review.rating;
    filmMeta.postVoteCount -= 1;
    await filmMeta.save();

    const film = await Film.findById(filmID);
    film.averageRating =
      (film.averageRating * filmMeta.preVoteCount + filmMeta.ratings) /
      filmMeta.postVoteCount;
    await film.save();

    await Review.findByIdAndDelete(reviewID);

    response.status(204).end();
  }
);

// post new films - RESERVED ONLY FOR ADMIN
filmsRouter.post("/", tmdb.getFilmToPost, async (request, response) => {
  const filmToPost = response.film;

  const film = new Film({
    _id: request.body._id,
    ...filmToPost,
  });

  const savedFilm = await film.save();

  response.status(201).json(savedFilm);
});

// delete film by id - RESERVED ONLY FOR ADMIN
filmsRouter.delete("/:id", async (request, response) => {
  await Film.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = filmsRouter;
