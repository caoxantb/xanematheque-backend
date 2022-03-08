/* eslint-disable no-undef */
const mongoose = require("mongoose");

// utils
const jwt = require("jsonwebtoken");
const logger = require("./logger");

const Film = require("../models/films/film");
const User = require("../models/users/user");

// config and error handling
const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token",
    });
  }

  next(error);
};

// user middlewares
const userExtractor = async (request, response, next) => {
  const authorization = request.get("authorization");
  const token =
    authorization && authorization.toLowerCase().startsWith("bearer ")
      ? authorization.substring(7)
      : null;

  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  request.user = await User.findById(decodedToken.id);
  request.decodedToken = decodedToken;

  next();
};

// query and pagination middlewares
const queryCloset = (request, response, next) => {
  const browseQuery = {};
  const sortAll = { averageRating: -1, year: -1, title: 1 };
  const sortOne = {};

  if (request.query.countries) browseQuery.countries = request.query.countries;
  if (request.query.genres) browseQuery.genres = request.query.genres;
  if (request.query.year) browseQuery.year = request.query.year;
  if (request.query.duration) browseQuery.duration = request.query.duration;

  request.browsed = browseQuery;

  if (request.query.sortBy) {
    sortOne[request.query.sortBy] = sortAll[request.query.sortBy];
    request.sorted = sortOne;
  } else {
    request.sorted = sortAll;
  }

  next();
};

const queryListAndCloseUp = (request, response, next) => {
  if (request.query.sortBy) {
    request.sorted = { followerCount: -1 };
  } else {
    request.sorted = { lastModified: -1 };
  }

  request.browsed = { films: request.params.id };

  next();
};

const queryReview = (request, response, next) => {
  if (request.query.sortBy) {
    request.sorted = { votes: -1 };
  } else {
    request.sorted = { lastModified: -1 };
  }

  request.browsed = { film: mongoose.Types.ObjectId(request.params.id) };

  next();
};

const queryCloseUp = (request, response, next) => {
  request.sorted = { lastModified: -1 };
  request.browsed = { series: request.params.name };

  next();
};

const pagination = (model) => {
  return async (request, response, next) => {
    const page = parseInt(request.query.page) || 1;
    const limit = 24;
    const skip = (page - 1) * limit;

    const browsedResults = await model.countDocuments(request.browsed);
    const results = await model
      .find(request.browsed)
      .sort(request.sorted)
      .limit(limit)
      .skip(skip);

    response.paginatedResult = {
      page: page,
      results: results,
      totalPage: Math.ceil(browsedResults / limit),
      totalResults: browsedResults,
    };

    next();
  };
};

// film middlewares
const getShortCrew = (request, response, next) => {
  const crew = response.crew;

  const shortCrew = [
    ...(crew.filter((c) => c.job === "Director") || []),
    ...(crew.filter((c) => c.job === "Screenplay") || []),
    ...(crew.filter((c) => c.job === "Director of Photography") || []),
    ...(crew.filter((c) => c.job === "Editor") || []),
    ...(crew.filter((c) => c.job === "Producer") || []),
  ];

  const crewResponse = shortCrew.length > 6 ? shortCrew.slice(0, 6) : shortCrew;
  response.crew = crewResponse.map((c) => ({
    _id: c.id,
    name: c.name,
    job: c.job,
    gender: c.gender,
    profilePicture: c.profile_path ? `${request.img}${c.profile_path}` : null,
  }));

  next();
};

const getCast = (request, response, next) => {
  const cast = response.cast;

  response.cast = cast.map((c) => ({
    _id: c.id,
    name: c.name,
    character: c.character,
    gender: c.gender,
    profilePicture: c.profile_path ? `${request.img}${c.profile_path}` : null,
  }));

  next();
};

const getCrew = (request, response, next) => {
  const crew = response.crew.map((c) => ({
    _id: c.id,
    name: c.name,
    job: c.job,
    department: c.department,
    gender: c.gender,
    profilePicture: c.profile_path ? `${request.img}${c.profile_path}` : null,
  }));

  const groupedDeps = {};
  crew.forEach(
    (c) =>
      (groupedDeps[c.department] = (groupedDeps[c.department] || []).concat(c))
  );

  response.crew = groupedDeps;

  next();
};

const getCredits = async (request, response, next) => {
  const cast = response.cast.map((c) => Film.findById(c.id));
  const castMapped = await Promise.all(cast);
  const character = response.cast.map((c) => c.character);
  const castMappedFinal = castMapped.map((c, i) => {
    if (c) c = { ...c._doc, character: character[i] };
    return c;
  });

  const crew = response.crew.map((c) => Film.findById(c.id));
  const crewMapped = await Promise.all(crew);
  const job = response.crew.map((c) => c.job);
  const crewMappedFinal = crewMapped.map((c, i) => {
    if (c) c = { ...c._doc, job: job[i] };
    return c;
  });
  const groupedJobs = {};
  crewMappedFinal.forEach((c) => {
    if (c) groupedJobs[c.job] = (groupedJobs[c.job] || []).concat(c);
  });

  response.credits = { Actor: castMappedFinal, ...groupedJobs };

  next();
};

module.exports = {
  userExtractor,
  requestLogger,
  unknownEndpoint,
  errorHandler,
  queryCloset,
  queryListAndCloseUp,
  queryReview,
  queryCloseUp,
  pagination,
  getShortCrew,
  getCast,
  getCrew,
  getCredits,
};
